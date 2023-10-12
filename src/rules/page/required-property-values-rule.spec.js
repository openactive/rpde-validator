const RequiredPropertyValuesRule = require('./required-property-values-rule');
const FeedLog = require('../../feed-log');
const RpdeNode = require('../../rpde-node');
const RpdeErrorType = require('../../errors/rpde-error-type');

describe('RequiredPropertyValuesRule', () => {
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
          state: 'updated',
          kind: 'session',
          id: '{c15814e5-8931-470c-8a16-ef45afedaece}',
          modified: 1453931101,
          data: {},
        },
        {
          state: 'deleted',
          kind: 'session',
          id: '{c15814e5-8931-470c-8a16-ef45afedaecf}',
          modified: 1453931101,
        },
      ],
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };
    rule = new RequiredPropertyValuesRule();
  });

  it('should raise no error when all fields are the correct type', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when the license field is not a string', () => {
    json.license = 1234;
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.INVALID_FORMAT);
    }
  });

  it('should raise an error when the id field is not a string or integer', () => {
    json.items[0].id = [];
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.INVALID_FORMAT);
    }
  });

  it('should raise an error when the data field is not an object', () => {
    json.items[0].data = [];
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.INVALID_FORMAT);
    }
  });

  it('should raise an error when the kind field is not a string', () => {
    json.items[0].kind = 123;
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.INVALID_FORMAT);
    }
  });

  it('should raise an error when the items field is not an array', () => {
    json.items = {};
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.INVALID_FORMAT);
    }
  });

  it('should raise an error when there is an items field that is not an object', () => {
    json.items[0] = 1234;
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.INVALID_FORMAT);
    }
  });
});
