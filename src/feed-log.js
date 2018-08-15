import FeedLogPage from './feed-log-page';

class FeedLog {
  constructor(url) {
    this.url = url;
    this.pages = [];
  }

  addPage(url) {
    this.pages.push(new FeedLogPage(url));
  }

  addError(error) {
    this.pages[this.pages.length - 1].addError(error);
  }

  addPageError(url, error) {
    for (const page of this.pages) {
      if (page.url === url) {
        page.addError(error);
        break;
      }
    }
  }
}

export default FeedLog;
