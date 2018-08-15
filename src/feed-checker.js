import FeedLog from './feed-log';
import RpdeNode from './rpde-node';
import Rules from './rules';
import UrlHelper from './helpers/url-helper';

class FeedChecker {
  constructor(url) {
    this.url = url;
    this.isLastPage = false;
    this.pageIndex = 0;
    this.pageTotal = 20;
    this.log = new FeedLog(url);
    this.lastTimestamp = null;
    this.lastChangeNumber = null;
    this.httpRules = [];
    this.pageRules = [];
    this.preLastPageRules = [];
    this.lastPageRules = [];

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

  addError(err) {
    this.log.addError(err);
  }

  walk(urlOverride) {
    const url = urlOverride || this.url;
    return this.load(url)
      .then((json) => {
        const nextUrl = UrlHelper.deriveUrl(json.next, url);

        if (nextUrl === url && json.items.length === 0) {
          this.isLastPage = true;
        }

        const node = new RpdeNode(
          url,
          json,
          this.log,
          this.pageIndex,
          this.isLastPage,
        );

        for (const rule of this.pageRules) {
          rule.validate(node);
        }

        this.lastTimestamp = UrlHelper.getParam('afterTimestamp', json.next, url);
        this.lastChangeNumber = UrlHelper.getParam('afterChangeNumber', json.next, url);

        this.pageIndex += 1;
        if (!this.isLastPage && this.pageIndex < this.pageTotal) {
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
    let paramKey;
    let urlKey;

    const preNode = new RpdeNode(
      this.url,
      {
        lastTimestamp: this.lastTimestamp,
        lastChangeNumber: this.lastChangeNumber,
      },
      this.log,
    );

    for (const rule of this.preLastPageRules) {
      rule.validate(preNode);
    }

    if (this.lastTimestamp !== null) {
      if (
        typeof this.lastTimestamp !== 'number'
        && !this.lastTimestamp.match(/^[1-9][0-9]*$/)
      ) {
        return null;
      }
      paramKey = 'lastTimestamp';
      urlKey = 'afterTimestamp';
    } else if (this.lastChangeNumber !== null) {
      if (
        typeof this.lastChangeNumber !== 'number'
        && !this.lastChangeNumber.match(/^[1-9][0-9]*$/)
      ) {
        return null;
      }
      paramKey = 'lastChangeNumber';
      urlKey = 'afterChangeNumber';
    }

    if (paramKey) {
      const value = this[paramKey] * 1000;
      const currentUrl = new URL(this.url);
      const lastPageUrl = `${currentUrl.origin}${currentUrl.pathname}?${urlKey}=${value}`;
      return this.load(lastPageUrl)
        .then((json) => {
          const lastPageNode = new RpdeNode(
            lastPageUrl,
            json,
            this.log,
            this.pageIndex,
            true,
          );

          for (const rule of this.lastPageRules) {
            rule.validate(lastPageNode);
          }

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

              for (const rule of this.lastPageRules) {
                rule.validate(nextNode);
              }
            });
        });
    }
    return null;
  }

  load(url) {
    this.log.addPage(url);
    return UrlHelper.fetch(url).then(
      (res) => {
        const node = new RpdeNode(
          url,
          res,
          this.log,
        );

        for (const rule of this.httpRules) {
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
