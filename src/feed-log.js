import FeedLogPage from './feed-log-page';

class FeedLog {
  constructor(url) {
    this.url = url;
    this.pages = [];
  }

  addPage(url) {
    const page = new FeedLogPage(url);
    this.pages.push(page);
    return page;
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
    return this.addPage(url);
  }

  addPageError(url, error) {
    this.getPage(url).addError(error);
  }
}

export default FeedLog;
