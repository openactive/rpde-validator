const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
  ValidationError,
} = require('@openactive/data-model-validator');
const { URL } = require('url');
const FeedLog = require('./feed-log');
const RpdeNode = require('./rpde-node');
const Rules = require('./rules');
const LastPageHelper = require('./helpers/last-page-helper');
const UrlHelper = require('./helpers/url-helper');
const { version } = require('./version');
const RpdeErrorType = require('./errors/rpde-error-type');

class FeedChecker {
  constructor(url, options = {}) {
    this.url = url;
    this.isLastPage = false;
    this.pageIndex = 0;
    this.log = new FeedLog(url);
    this.lastTimestamp = null;
    this.firstId = null;
    this.lastId = null;
    this.lastChangeNumber = null;
    this.httpRules = [];
    this.pageRules = [];
    this.preLastPageRules = [];
    this.lastPageRules = [];
    this.logCallback = options.logCallback;

    this.userAgent = options.userAgent || `RPDE_Validator/${version} (+https://validator.openactive.io/rpde)`;
    this.pageLimit = 20;
    this.requestDelayMs = 0;
    this.timeoutMs = 10000;
    const overrideOptions = [
      'pageLimit',
      'requestDelayMs',
      'timeoutMs',
    ];

    for (const param of overrideOptions) {
      if (
        typeof options[param] === 'number'
        && !Number.isNaN(options[param])
      ) {
        this[param] = options[param];
      }
    }

    for (let index = 0; index < Rules.http.length; index += 1) {
      this.httpRules.push(new Rules.http[index]());
    }
    for (let index = 0; index < Rules.page.length; index += 1) {
      this.pageRules.push(new Rules.page[index]());
    }
    for (let index = 0; index < Rules.preLastPage.length; index += 1) {
      this.preLastPageRules.push(new Rules.preLastPage[index]());
    }
    for (let index = 0; index < Rules.lastPage.length; index += 1) {
      this.lastPageRules.push(new Rules.lastPage[index]());
    }
  }

  logMessage(msg, extra = {}) {
    if (typeof this.logCallback === 'function') {
      this.logCallback(
        {
          percentage: this.percentageComplete(),
          verbosity: 1,
          ...extra,
          message: msg,
        },
      );
    }
  }

  percentageComplete() {
    return (this.pageIndex / (this.pageLimit + 1)) * 100;
  }

  addError(err) {
    this.log.addError(err);
  }

  walk(urlOverride) {
    const url = urlOverride || this.url;
    return this.load(url)
      .then((json) => {
        if (typeof json !== 'object' || json === null) {
          return null;
        }

        const nextUrl = UrlHelper.deriveUrl(json.next, url);

        this.logMessage(
          `Next URL is ${nextUrl}`,
          {
            verbosity: 2,
          },
        );

        if (
          nextUrl === url
          && json.items instanceof Array
          && json.items.length === 0
        ) {
          this.logMessage(
            `${url} is the last page`,
            {
              verbosity: 3,
            },
          );
          this.isLastPage = true;
        }

        const node = new RpdeNode(
          url,
          json,
          this.log,
          this.pageIndex,
          this.isLastPage,
        );

        this.logMessage(`Applying page rules to ${url}`);

        for (const rule of this.pageRules) {
          this.logMessage(
            `Applying rule ${rule.meta.name} to ${url}`,
            {
              verbosity: 2,
            },
          );
          rule.validate(node);
        }

        this.lastTimestamp = UrlHelper.getParam('afterTimestamp', json.next, url);
        this.lastChangeNumber = UrlHelper.getParam('afterChangeNumber', json.next, url);
        this.lastId = UrlHelper.getParam('afterId', json.next, url);
        if (this.firstId === null) {
          this.firstId = this.lastId;
        }

        this.pageIndex += 1;
        if (
          nextUrl !== url
          && UrlHelper.isUrl(nextUrl)
          && this.pageIndex < this.pageLimit
        ) {
          return new Promise(
            (resolve) => {
              if (this.requestDelayMs > 0) {
                this.logMessage(
                  `Waiting for ${this.requestDelayMs}ms before next request`,
                  {
                    verbosity: 2,
                  },
                );
              }
              setTimeout(resolve, this.requestDelayMs);
            },
          ).then(() => this.walk(nextUrl));
        }

        const afterNode = new RpdeNode(
          this.url,
          json,
          this.log,
          this.pageIndex,
          this.isLastPage,
        );

        for (const rule of this.pageRules) {
          rule.after(afterNode);
        }

        return this.testLastPage();
      });
  }

  testLastPage() {
    const preNode = new RpdeNode(
      this.url,
      {
        lastTimestamp: this.lastTimestamp,
        lastId: this.lastId,
        lastChangeNumber: this.lastChangeNumber,
      },
      this.log,
    );

    this.logMessage(`Applying pre last page rules to ${this.url}`);

    for (const rule of this.preLastPageRules) {
      this.logMessage(
        `Applying rule ${rule.meta.name}`,
        {
          verbosity: 2,
        },
      );
      rule.validate(preNode);
    }

    const currentUrl = new URL(this.url);
    let lastPageUrl = `${currentUrl.origin}${currentUrl.pathname}?`;
    let hasUrl = false;
    if (this.lastTimestamp !== null) {
      const value = LastPageHelper.calculateLastPageTimestamp(this.lastTimestamp);
      if (value !== null) {
        lastPageUrl = `${lastPageUrl}afterTimestamp=${value}`;
        if (this.firstId !== null) {
          lastPageUrl = `${lastPageUrl}&afterId=${this.firstId}`;
        }
        hasUrl = true;
      }
    } else if (this.lastChangeNumber !== null) {
      const value = LastPageHelper.calculateLastPageChangeNumber();
      if (value !== null) {
        lastPageUrl = `${lastPageUrl}afterChangeNumber=${value}`;
        hasUrl = true;
      }
    }

    if (hasUrl) {
      return this.load(lastPageUrl)
        .then((json) => {
          const lastPageNode = new RpdeNode(
            lastPageUrl,
            json,
            this.log,
            this.pageIndex,
            true,
          );

          this.logMessage(`Applying last page rules to ${lastPageUrl}`);

          for (const rule of this.lastPageRules) {
            this.logMessage(
              `Applying rule ${rule.meta.name} to ${lastPageUrl}`,
              {
                verbosity: 2,
              },
            );
            rule.validate(lastPageNode);
          }

          if (typeof json === 'object' && typeof json.next !== 'undefined') {
            const nextUrlRaw = UrlHelper.deriveUrl(json.next, lastPageUrl);

            return this.load(nextUrlRaw)
              .then((nextJson) => {
                const nextNode = new RpdeNode(
                  nextUrlRaw,
                  nextJson,
                  this.log,
                  this.pageIndex,
                  true,
                );
                nextNode.previousNode = lastPageNode;

                this.logMessage(`Applying last page rules to ${nextUrlRaw}`);

                for (const rule of this.lastPageRules) {
                  this.logMessage(
                    `Applying rule ${rule.meta.name} to ${nextUrlRaw}`,
                    {
                      verbosity: 2,
                    },
                  );
                  rule.validate(nextNode);
                }
              });
          }
          return null;
        });
    }
    return null;
  }

  load(url) {
    this.logMessage(`Loading ${url}...`);
    this.log.addPage(url);
    const options = {
      headers: {
        'User-Agent': this.userAgent,
      },
    };
    let res;
    return UrlHelper.fetch(url, options, this.timeoutMs).then(
      (response) => {
        this.logMessage(`Loaded ${url}`);
        res = response;
        return res.text();
      },
    ).then(
      (body) => {
        const node = new RpdeNode(
          url,
          {
            contentType: res.headers.get('content-type'),
            status: res.status,
            body,
          },
          this.log,
        );

        this.logMessage(`Applying HTTP rules to ${url}`);

        for (const rule of this.httpRules) {
          this.logMessage(
            `Applying rule ${rule.meta.name} to ${url}`,
            {
              verbosity: 2,
            },
          );
          rule.validate(node);
        }

        let json;
        try {
          json = JSON.parse(body);
        } catch (e) {
          return null;
        }
        return json;
      },
    ).catch(
      (e) => {
        if (e.name === 'TimeoutError') {
          this.log.addPageError(
            url,
            new ValidationError(
              {
                category: ValidationErrorCategory.INTERNAL,
                type: RpdeErrorType.HTTP_ERROR,
                severity: ValidationErrorSeverity.FAILURE,
                message: e.message,
              },
            ),
          );
        }
        return undefined;
      },
    );
  }
}

export default FeedChecker;
