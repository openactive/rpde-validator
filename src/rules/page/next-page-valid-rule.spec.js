import NextPageValidRule from './next-page-valid-rule.js';
import FeedLog from '../../feed-log.js';
import RpdeNode from '../../rpde-node.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

describe('NextPageValidRule', () => {
  let log;
  let rule;
  let json;
  const url = 'http://example.org/feed';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    json = {
      next: `${url}?afterChangeNumber=1234`,
      items: [],
    };
    rule = new NextPageValidRule();
  });

  it('should raise no error when the next parameter is a valid URL', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the next parameter is not a valid URL', () => {
    json.next = '/feed?afterChangeNumber=1234';
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_TYPE);
  });
});
