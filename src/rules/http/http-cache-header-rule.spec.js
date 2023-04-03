import HttpContentTypeRule from './http-content-type-rule.js';
import FeedLog from '../../feed-log.js';
import RpdeNode from '../../rpde-node.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

describe('HttpContentTypeRule', () => {
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
    rule = new HttpContentTypeRule();
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
    data.contentType = 'application/vnd.openactive.rpde+json; version=1';
    data.cacheControl = 'private';
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the Cache-Control is "public, max-age=3600" for an Orders feed', () => {
    data.contentType = 'application/vnd.openactive.rpde+json; version=1';
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.EXCESSIVE_CACHE_CONTROL);
  });
});
