const MinimumItemsRule = require('./minimum-items-rule');
const FeedLog = require('../../feed-log');
const RpdeNode = require('../../rpde-node');
const RpdeErrorType = require('../../errors/rpde-error-type');

describe('MinimumItemsRule', () => {
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
    rule = new MinimumItemsRule();
  });

  it('should raise no error when there are at least 500 items', () => {
    for (let i = 0; i < 500; i += 1) {
      json.items.push({
        state: 'deleted',
        kind: 'session',
        id: i,
        modified: 1534485464,
      });
    }
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);
    // Error is only thrown on second validate
    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise no error when there is no items array', () => {
    const node = new RpdeNode(
      url,
      {},
      log,
    );

    rule.validate(node);
    // Error is only thrown on second validate
    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the there are fewer than 500 items', () => {
    for (let i = 0; i < 499; i += 1) {
      json.items.push({
        state: 'deleted',
        kind: 'session',
        id: i,
        modified: 1534485464,
      });
    }
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);
    // Error is only thrown on second validate
    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.MINIMUM_ITEMS_PER_PAGE);
  });
});
