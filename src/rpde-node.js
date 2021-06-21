class RpdeNode {
  constructor(url, data, log, pageIndex, isLastPage, isInitialHarvestComplete, isOrdersFeed) {
    this.url = url;
    this.data = data;
    this.log = log;
    this.pageIndex = pageIndex;
    this.isLastPage = isLastPage;
    this.isInitialHarvestComplete = isInitialHarvestComplete;
    this.isOrdersFeed = isOrdersFeed;
  }
}

export default RpdeNode;
