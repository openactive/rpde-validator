import NoLastPageItemsRule from './no-last-page-items-rule';
import FeedLog from '../../feed-log';
import RpdeNode from '../../rpde-node';
import RpdeErrorType from '../../errors/rpde-error-type';

describe('NoLastPageItemsRule', () => {
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
    rule = new NoLastPageItemsRule();
  });

  it('should raise no error when the node has no items', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the node has items', () => {
    json.items.push({
      data: {},
    });
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.LAST_PAGE_NO_ITEMS);
  });
});
