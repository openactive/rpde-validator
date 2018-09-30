import AfterTimestampRule from './after-timestamp-rule';
import FeedLog from '../../feed-log';
import RpdeNode from '../../rpde-node';
import RpdeErrorType from '../../errors/rpde-error-type';

describe('AfterTimestampRule', () => {
  let log;
  let rule;
  let json;
  const url = 'http://example.org/feed';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    json = {
      next: `${url}?afterTimestamp=1534485464&afterId=1234`,
      items: [
        {
          data: {},
          state: 'updated',
          kind: 'session',
          id: '1234',
          modified: 1534485464,
        },
      ],
    };
    rule = new AfterTimestampRule();
  });

  it('should raise no error when the timestamp and modified are numeric and timestamp is increasing', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.lastTimestamp = 1534480464;

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise a warning when modified is numeric and a string', () => {
    json.items[0].modified = '1534485464';
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.lastTimestamp = 1534480464;

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_TYPE);
  });

  it('should raise an error when the timestamp is used without an afterId', () => {
    json.next = `${url}?afterTimestamp=1534485464`;
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(2);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.AFTER_ID_WITH_TIMESTAMP);
    expect(log.pages[0].errors[1].type).toBe(RpdeErrorType.LAST_ITEM_NOT_MATCHING_NEXT);
  });

  it('should raise an error when the timestamp is used and afterID is misspelt', () => {
    json.next = `${url}?afterTimestamp=1534485464&afterID=1234`;
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.AFTER_ID_WITH_TIMESTAMP);
    expect(log.pages[0].errors[0].message).toContain('afterID');
  });

  it('should raise an error when the timestamp is not numeric but modified is', () => {
    json.next = `${url}?afterTimestamp=2018-01-01T00:00:00&afterId=123`;

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
    expect(log.pages[0].errors.length).toBe(2);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_TYPE);
    expect(log.pages[0].errors[1].type).toBe(RpdeErrorType.LAST_ITEM_NOT_MATCHING_NEXT);
  });

  it('should raise a warning when the timestamp is not numeric and modified is not numeric', () => {
    json.next = `${url}?afterTimestamp=2018-01-01T00:00:00&afterId=1234`;
    json.items[0].modified = '2018-01-01T00:00:00';
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
    expect(log.pages[0].errors.length).toBe(2);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.INVALID_TYPE);
    expect(log.pages[0].errors[1].type).toBe(RpdeErrorType.INVALID_TYPE);
  });

  it('should raise an error when afterTimestamp is not incrementing', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.lastTimestamp = 1534485464;
    rule.lastId = 1234;

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.AFTER_PARAM_SHOULD_INCREASE);
  });

  it('should raise no error when afterTimestamp is incrementing', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.lastTimestamp = '534';

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise no error when afterTimestamp is the same, but afterId is incrementing', () => {
    json.next = `${url}?afterTimestamp=1534485464&afterId=ABC345`;
    json.items[0].id = 'ABC345';
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );
    rule.lastTimestamp = '1534482464';
    rule.lastId = 'ABC123';

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });
});
