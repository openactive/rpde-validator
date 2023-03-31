import DuplicateItemsRule from './duplicate-items-rule';
import FeedLog from '../../feed-log';
import RpdeNode from '../../rpde-node';
import RpdeErrorType from '../../errors/rpde-error-type';

describe('DuplicateItemsRule', () => {
  let log;
  let rule;
  let json;
  const url = 'http://example.org/feed';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    json = {
      next: `${url}?afterTimestamp=1534482464`,
      items: [
        {
          state: 'deleted',
          kind: 'session',
          id: 'abc123',
          modified: 1534485464,
        },
        {
          state: 'deleted',
          kind: 'session',
          id: 'abc124',
          modified: 1534485464,
        },
      ],
    };
    rule = new DuplicateItemsRule();
  });

  it('should raise no error when a node contains no duplicate items', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });
  it('should raise no error when multiple nodes contain no duplicate items', () => {
    const json2 = { ...json };
    json2.items = json2.items.slice();
    json.items.splice(0, 1);
    json2.items.splice(1, 1);

    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    const node2 = new RpdeNode(
      url,
      json2,
      log,
      1,
      false,
    );

    rule.validate(node);
    rule.validate(node2);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when a node contains duplicate items', () => {
    json.items[1].id = json.items[0].id;
    const node = new RpdeNode(
      url,
      json,
      log,
      0,
      false,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.NO_DUPLICATE_ITEMS);
  });

  it('should raise an error when multiple nodes contain duplicate items', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    const node2 = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.validate(node);
    rule.validate(node2);
    rule.after(node2);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(2);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.NO_DUPLICATE_ITEMS);
    expect(log.pages[0].errors[1].type).toBe(RpdeErrorType.NO_DUPLICATE_ITEMS);
  });
});
