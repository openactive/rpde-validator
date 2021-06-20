class RpdeNode {
  constructor(url, data, log, pageIndex, isLastPage, isInitialHarvestComplete) {
    this.url = url;
    this.data = data;
    this.log = log;
    this.pageIndex = pageIndex;
    this.isLastPage = isLastPage;
    this.isInitialHarvestComplete = isInitialHarvestComplete;
  }
}

export default RpdeNode;
