import HttpContentTypeRule from './http-content-type-rule';
import FeedLog from '../../feed-log';
import RpdeNode from '../../rpde-node';
import RpdeErrorType from '../../errors/rpde-error-type';

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
    };
    rule = new HttpContentTypeRule();
  });

  it('should raise no error when the content type is application/json', () => {
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the content type is not application/json', () => {
    data.contentType = 'text/html';
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_CONTENT_TYPE);
  });
});
