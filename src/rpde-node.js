class RpdeNode {
  constructor(url, data, log, pageIndex, isLastPage, isItemDuplicationPermissible, isOrdersFeed) {
    this.url = url;
    this.data = data;
    this.log = log;
    this.pageIndex = pageIndex;
    this.isLastPage = isLastPage;
    this.isItemDuplicationPermissible = isItemDuplicationPermissible;
    this.isOrdersFeed = isOrdersFeed;
  }
}

module.exports = RpdeNode;
