import FeedLog from './feed-log';
import RpdeNode from './rpde-node';
import Rules from './rules';

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
    url, json, pageIndex, contentType, status,
  }) {
    const log = new FeedLog(url);

    const isLastPage = (
      json.next === url
      && json.items instanceof Array
      && json.items.length === 0
    );

    const node = new RpdeNode(
      url,
      json,
      log,
      pageIndex,
      isLastPage,
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
        status,
        body: json,
      },
      log,
    );

    for (const rule of this.httpRules) {
      rule.validate(rawNode);
    }

    return log.pages.flatMap(page => page.errors).filter(error => error.severity === 'failure');
  }
}

export default FeedPageChecker;
