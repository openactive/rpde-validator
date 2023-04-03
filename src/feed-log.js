const FeedLogPage = require('./feed-log-page');

class FeedLog {
  constructor(url) {
    this.url = url;
    this.pages = [];
  }

  addPage(url) {
    return this.getPage(url);
  }

  addError(error) {
    this.pages[this.pages.length - 1].addError(error);
  }

  getPage(url) {
    for (const page of this.pages) {
      if (page.url === url) {
        return page;
      }
    }
    const page = new FeedLogPage(url);
    this.pages.push(page);
    return page;
  }

  addPageError(url, error) {
    this.getPage(url).addError(error);
  }
}

module.exports = FeedLog;
