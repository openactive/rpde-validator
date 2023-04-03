import RequiredPropertiesRule from './required-properties-rule.js';
import FeedLog from '../../feed-log.js';
import RpdeNode from '../../rpde-node.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

describe('RequiredPropertiesRule', () => {
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
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };
    rule = new RequiredPropertiesRule();
  });

  it('should raise no error when all required fields are present', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when required fields are not present', () => {
    const node = new RpdeNode(
      url,
      {},
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(3);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.MISSING_REQUIRED_FIELD);
    }
  });

  it('should not raise an error when license is not present in Orders feed', () => {
    const node = new RpdeNode(
      url,
      {
        next: `${url}?afterChangeNumber=1234`,
        items: [],
      },
      log,
      undefined,
      undefined,
      undefined,
      true,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when license property is present in the Orders feed', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      undefined,
      undefined,
      undefined,
      true,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.FIELD_NOT_ALLOWED);
    }
  });
});
