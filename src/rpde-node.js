class RpdeNode {
  constructor(url, data, log, pageIndex, isLastPage) {
    this.url = url;
    this.data = data;
    this.log = log;
    this.pageIndex = pageIndex;
    this.isLastPage = isLastPage;
  }
}

export default RpdeNode;
