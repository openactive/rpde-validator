import DeletedItemsRule from './deleted-items-rule';
import FeedLog from '../../feed-log';
import RpdeNode from '../../rpde-node';
import RpdeErrorType from '../../errors/rpde-error-type';

describe('DeletedItemsRule', () => {
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
      ],
    };
    rule = new DeletedItemsRule();
  });

  it('should raise no error when a node contains a deleted item', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    rule.validate(node);
    rule.after(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });
  it('should raise no error when only one node contains a deleted item', () => {
    const node = new RpdeNode(
      url,
      Object.assign(
        {},
        json,
        {
          items: [
            {
              data: {},
              state: 'updated',
              kind: 'session',
              id: 'abc120',
              modified: 1534485464,
            },
          ],
        },
      ),
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

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when a node doesn\'t contain a deleted item', () => {
    json.items[0].state = 'updated';
    const node = new RpdeNode(
      url,
      json,
      log,
      0,
      false,
    );

    rule.validate(node);
    rule.after(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.NO_DELETED_ITEMS);
  });

  it('should raise an error when multiple nodes don\'t contain a deleted item', () => {
    json.items[0].state = 'updated';
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    const node2 = new RpdeNode(
      url,
      Object.assign({}, json, { next: `${url}?afterTimestamp=1534487464` }),
      log,
      1,
      false,
    );
    rule.validate(node);
    rule.validate(node2);
    rule.after(node2);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.NO_DELETED_ITEMS);
  });
});
