class FeedLogPage {
  constructor(url) {
    this.url = url;
    this.errors = [];
  }

  addError(error) {
    this.errors.push(error);
  }
}

export default FeedLogPage;
