const HttpStatusRule = require('./http-status-rule');
const FeedLog = require('../../feed-log');
const RpdeNode = require('../../rpde-node');
const RpdeErrorType = require('../../errors/rpde-error-type');

describe('HttpStatusRule', () => {
  let log;
  let rule;
  let data;
  const url = 'http://example.org/feed';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    data = {
      status: 200,
    };
    rule = new HttpStatusRule();
  });

  it('should raise no error when the status is 200', () => {
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the status is not 200', () => {
    data.status = 500;
    const node = new RpdeNode(
      url,
      data,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_STATUS_CODE);
  });
});
