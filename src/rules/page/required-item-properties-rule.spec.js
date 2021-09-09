import RequiredItemPropertiesRule from './required-item-properties-rule';
import FeedLog from '../../feed-log';
import RpdeNode from '../../rpde-node';
import RpdeErrorType from '../../errors/rpde-error-type';

describe('RequiredItemPropertiesRule', () => {
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
    rule = new RequiredItemPropertiesRule();
  });

  it('should raise no error when all required fields are present', () => {
    json.items.push(
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
    );
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).not.toHaveBeenCalled();
  });

  it('should raise an error when required fields are not present in an item', () => {
    json.items.push(
      {},
      {},
    );
    const node = new RpdeNode(
      url,
      json,
      log,
    );

    rule.validate(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(4);
    for (const error of log.pages[0].errors) {
      expect(error.type).toBe(RpdeErrorType.MISSING_REQUIRED_FIELD);
    }
  });

  it('should raise an error when the data field is missing from an updated item', () => {
    json.items.push(
      {
        state: 'updated',
        kind: 'session',
        id: '{c15814e5-8931-470c-8a16-ef45afedaece}',
        modified: 1453931101,
      },
    );
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
      expect(error.type).toBe(RpdeErrorType.MISSING_DATA_IN_UPDATED_ITEM);
    }
  });
  it('should raise an error when the data field is present in a deleted item', () => {
    json.items.push(
      {
        state: 'deleted',
        kind: 'session',
        id: '{c15814e5-8931-470c-8a16-ef45afedaece}',
        modified: 1453931101,
        data: {},
      },
    );
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
      expect(error.type).toBe(RpdeErrorType.UNNECESSARY_DATA_IN_DELETED_ITEM);
    }
  });
});
