const LastPageUrlIsSelfRule = require('./last-page-url-is-self-rule');
const FeedLog = require('../../feed-log');
const RpdeNode = require('../../rpde-node');
const RpdeErrorType = require('../../errors/rpde-error-type');

describe('LastPageUrlIsSelfRule', () => {
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
    rule = new LastPageUrlIsSelfRule();
  });

  it('should raise no error when the previousNode has identical content to the current', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
    );
    node.previousNode = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the previousNode does not have identical content to the current', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
    );
    node.previousNode = new RpdeNode(
      url,
      ({ ...json, next: `${url}?afterChangeNumber=1235` }),
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.LAST_PAGE_REFERENCE_SELF);
  });
});
