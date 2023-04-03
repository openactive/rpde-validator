import AfterChangeNumberRule from './after-change-number-rule.js';
import FeedLog from '../../feed-log.js';
import RpdeNode from '../../rpde-node.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

describe('AfterChangeNumberRule', () => {
  let log;
  let rule;
  let json;
  const url = 'http://example.org/feed';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    json = {
      next: `${url}?afterChangeNumber=1234`,
      items: [
        {
          data: {},
          state: 'updated',
          kind: 'session',
          id: 'abc123',
          modified: 123,
        },
      ],
    };
    rule = new AfterChangeNumberRule();
  });

  it('should raise no error when the change number and modified are numeric and change number is increasing', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.lastChangeNumber = 93;

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the change number is not numeric', () => {
    json.next = `${url}?afterChangeNumber=ABC1234`;

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
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_TYPE);
  });

  it('should raise an error when modified is not numeric', () => {
    json.items[0].modified = 'ABC1234';

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
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_TYPE);
  });

  it('should raise an error when afterChangeNumber is not incrementing', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.lastChangeNumber = 1234;

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.AFTER_PARAM_SHOULD_INCREASE);
  });

  it('should raise no error when afterChangeNumber is incrementing', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.lastChangeNumber = '534';

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });
});
