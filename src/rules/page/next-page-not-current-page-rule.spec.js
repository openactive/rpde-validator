import NextPageNotCurrentPageRule from './next-page-not-current-page-rule.js';
import FeedLog from '../../feed-log.js';
import RpdeNode from '../../rpde-node.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

describe('NextPageNotCurrentPageRule', () => {
  let log;
  let rule;
  let json;
  const url = 'http://example.org/feed?afterChangeNumber=1234&afterId=1234';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    json = {
      next: url,
      items: [],
    };
    rule = new NextPageNotCurrentPageRule();
  });

  it('should raise no error when the next URL is the same as current URL with zero items', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the next URL is the same as current URL with more than zero items', () => {
    json.items = [
      {
        state: 'deleted',
        kind: 'session',
        id: 'abc123',
        modified: 1534485464,
      },
    ];
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_NEXT_URL_FOR_ZERO_ITEMS);
  });
});
