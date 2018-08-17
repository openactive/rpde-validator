import { URL } from 'url';
import FeedLog from './feed-log';
import RpdeNode from './rpde-node';
import Rules from './rules';
import UrlHelper from './helpers/url-helper';

class FeedChecker {
  constructor(url, logCallback) {
    this.url = url;
    this.isLastPage = false;
    this.pageIndex = 0;
    this.pageTotal = 20;
    this.log = new FeedLog(url);
    this.lastTimestamp = null;
    this.firstId = null;
    this.lastId = null;
    this.lastChangeNumber = null;
    this.httpRules = [];
    this.pageRules = [];
    this.preLastPageRules = [];
    this.lastPageRules = [];
    this.logCallback = logCallback;

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
        Object.assign(
          {
            percentage: this.percentageComplete(),
            verbosity: 1,
          },
          extra,
          {
            message: msg,
          },
        ),
      );
    }
  }

  percentageComplete() {
    return (this.pageIndex / (this.pageTotal + 1)) * 100;
  }

  addError(err) {
    this.log.addError(err);
  }

  walk(urlOverride) {
    const url = urlOverride || this.url;
    return this.load(url)
      .then((json) => {
        const nextUrl = typeof json === 'object' ? UrlHelper.deriveUrl(json.next, url) : undefined;

        if (
          nextUrl === url
          && typeof json === 'object'
          && json.items instanceof Array
          && json.items.length === 0
        ) {
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

        if (typeof json === 'object') {
          this.lastTimestamp = UrlHelper.getParam('afterTimestamp', json.next, url);
          this.lastChangeNumber = UrlHelper.getParam('afterChangeNumber', json.next, url);
          this.lastId = UrlHelper.getParam('afterChangeNumber', json.next, url);
          if (this.firstId === null) {
            this.firstId = this.lastId;
          }
        } else {
          this.lastTimestamp = null;
          this.lastChangeNumber = null;
          this.lastId = null;
        }

        this.pageIndex += 1;
        if (
          typeof json === 'object'
          && nextUrl !== url
          && UrlHelper.isUrl(nextUrl)
          && this.pageIndex < this.pageTotal
        ) {
          return this.walk(nextUrl);
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
      if (
        typeof this.lastTimestamp !== 'number'
        && !this.lastTimestamp.match(/^[1-9][0-9]*$/)
      ) {
        return null;
      }
      const value = this.lastTimestamp * 10;
      lastPageUrl = `${lastPageUrl}afterTimestamp=${value}`;
      if (this.firstId !== null) {
        lastPageUrl = `${lastPageUrl}&afterId=${this.firstId}`;
      }
      hasUrl = true;
    } else if (this.lastChangeNumber !== null) {
      if (
        typeof this.lastChangeNumber !== 'number'
        && !this.lastChangeNumber.match(/^[1-9][0-9]*$/)
      ) {
        return null;
      }
      const value = this.lastChangeNumber * 10;
      lastPageUrl = `${lastPageUrl}afterChangeNumber=${value}`;
      hasUrl = true;
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
    return UrlHelper.fetch(url).then(
      (res) => {
        this.logMessage(`Loaded ${url}`);
        const node = new RpdeNode(
          url,
          res,
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

        return res.json();
      },
    ).catch(
      () => undefined,
    );
  }
}

export default FeedChecker;
