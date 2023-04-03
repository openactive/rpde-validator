const ValidJsonObjectRule = require('./valid-json-object-rule');
const FeedLog = require('../../feed-log');
const RpdeNode = require('../../rpde-node');
const RpdeErrorType = require('../../errors/rpde-error-type');

describe('ValidJsonObjectRule', () => {
  let log;
  let rule;
  let data;
  const url = 'http://example.org/feed';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    data = {
      body: JSON.stringify(
        {
          items: [],
          next: url,
        },
      ),
    };
    rule = new ValidJsonObjectRule();
  });

  it('should raise no error when the content is json', () => {
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the content is not json', () => {
    data.body = '"No content"';
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_JSON);
  });
});
