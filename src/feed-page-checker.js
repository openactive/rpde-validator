const FeedLog = require('./feed-log');
const RpdeNode = require('./rpde-node');
const Rules = require('./rules');

class FeedPageChecker {
  constructor() {
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
    for (let index = 0; index < Rules.lastPage.length; index += 1) {
      this.lastPageRules.push(new Rules.lastPage[index]());
    }
  }

  validateRpdePage({
    url, json, pageIndex, contentType, cacheControl, status, isInitialHarvestComplete, isOrdersFeed,
  }) {
    const log = new FeedLog(url);

    const isLastPage = (
      json.next === url
      && json.items instanceof Array
      && json.items.length === 0
    );

    const cacheControlHeaderParser = (cacheControlHeader) => {
      const maxAge = Number(/public,.*max-age=(?<maxAge>[0-9]+)/.exec(cacheControlHeader)?.groups.maxAge);
      return {
        isCachedPage: maxAge > 0,
        maxAge,
      };
    };

    const cacheControlComponents = cacheControlHeaderParser(cacheControl);

    const node = new RpdeNode(
      url,
      json,
      log,
      pageIndex,
      isLastPage,
      cacheControlComponents,
      isInitialHarvestComplete,
      isOrdersFeed,
    );

    if (isLastPage) {
      for (const rule of this.lastPageRules) {
        rule.validate(node);
      }
    } else {
      for (const rule of this.pageRules) {
        rule.validate(node);
      }
    }

    const rawNode = new RpdeNode(
      url,
      {
        contentType,
        cacheControl,
        status,
        body: json,
      },
      log,
      undefined,
      isLastPage,
      cacheControlComponents,
      undefined,
      isOrdersFeed,
    );

    for (const rule of this.httpRules) {
      rule.validate(rawNode);
    }

    return log.pages.flatMap((page) => page.errors).filter((error) => error.severity === 'failure');
  }
}

export default FeedPageChecker;
