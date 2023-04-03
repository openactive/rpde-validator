const NextUrlBasePathMatchCurrentPage = require('./next-page-base-url-match-current-page-rule');
const FeedLog = require('../../feed-log');
const RpdeNode = require('../../rpde-node');
const RpdeErrorType = require('../../errors/rpde-error-type');

describe('NextUrlBasePathMatchCurrentPage', () => {
  let log;
  let rule;
  let json;
  const url = 'https://example.org/feed?afterChangeNumber=1234&afterId=1234';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    json = {
      next: url,
      items: [],
    };
    rule = new NextUrlBasePathMatchCurrentPage();
  });

  it('should raise no error when the base URL of the next parameter is equal to the base URL of the current page', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the base URL of the next parameter is not equal to the base URL of the current page', () => {
    json.next = 'https://example.org/feed2?afterChangeNumber=1234&afterId=1234';
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.BASE_URL_MISMATCH);
  });
});
