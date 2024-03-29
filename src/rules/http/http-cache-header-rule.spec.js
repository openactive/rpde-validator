const HttpCacheHeaderRule = require('./http-cache-header-rule');
const FeedLog = require('../../feed-log');
const RpdeNode = require('../../rpde-node');
const RpdeErrorType = require('../../errors/rpde-error-type');

describe('HttpCacheHeaderRule', () => {
  let log;
  let rule;
  let data;
  const url = 'http://example.org/feed';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    data = {
      contentType: 'application/json',
      cacheControl: 'public, max-age=3600',
    };
    rule = new HttpCacheHeaderRule();
  });

  it('should raise no error when the Cache-Control is "public, max-age=3600" for a page that is not the last page', () => {
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the Cache-Control is "public, max-age=3600" for the last page', () => {
    const node = new RpdeNode(
      url,
      data,
      log,
      undefined,
      true, // isLastPage
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.MISSING_CACHE_CONTROL);
  });

  it('should raise no error when the Cache-Control is "public, max-age=8" for the last page', () => {
    data.cacheControl = 'public, max-age=8';
    const node = new RpdeNode(
      url,
      data,
      log,
      undefined,
      true, // isLastPage
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the Cache-Control is "public, max-age=8" for a page that is not the last page', () => {
    data.cacheControl = 'public, max-age=8';
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.MISSING_CACHE_CONTROL);
  });

  it('should raise no error when the Cache-Control is "private" for an Orders feed', () => {
    data.cacheControl = 'private';
    const node = new RpdeNode(
      url,
      data,
      log,
      undefined,
      undefined,
      undefined,
      true, // isOrdersFeed
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the Cache-Control is "public, max-age=3600" for an Orders feed', () => {
    const node = new RpdeNode(
      url,
      data,
      log,
      undefined,
      undefined,
      undefined,
      true, // isOrdersFeed
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.EXCESSIVE_CACHE_CONTROL);
  });
});
