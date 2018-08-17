import RequiredPropertiesRule from './required-properties-rule';
import FeedLog from '../../feed-log';
import RpdeNode from '../../rpde-node';
import RpdeErrorType from '../../errors/rpde-error-type';

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
});
