class RpdeNode {
  constructor(url, data, log, pageIndex, isLastPage, cacheControlComponents, isInitialHarvestComplete, isOrdersFeed) {
    this.url = url;
    this.data = data;
    this.log = log;
    this.pageIndex = pageIndex;
    this.isLastPage = isLastPage;
    this.cacheControlComponents = cacheControlComponents;
    this.isInitialHarvestComplete = isInitialHarvestComplete;
    this.isOrdersFeed = isOrdersFeed;
  }
}

export default RpdeNode;
