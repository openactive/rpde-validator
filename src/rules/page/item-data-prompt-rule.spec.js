import ItemDataPromptRule from './item-data-prompt-rule';
import FeedLog from '../../feed-log';
import RpdeNode from '../../rpde-node';
import RpdeErrorType from '../../errors/rpde-error-type';

describe('ItemDataPromptRule', () => {
  let log;
  let rule;
  let json;
  const url = 'http://example.org/feed';
  const openActiveContext = 'https://www.openactive.io/ns/oa.jsonld';

  beforeEach(() => {
    log = new FeedLog();
    spyOn(log, 'addPageError').and.callThrough();
    json = {
      next: `${url}?afterTimestamp=1534482464`,
      items: [
        {
          state: 'updated',
          kind: 'session',
          id: 'abc123',
          modified: 1534485464,
          data: {
            '@context': openActiveContext,
          },
        },
      ],
    };
    rule = new ItemDataPromptRule();
  });

  it('should raise a suggestion when a node contains item data with an open active context in a string', () => {
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    rule.validate(node);
    rule.after(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.HAS_MODELLING_DATA);
  });

  it('should raise a suggestion when a node contains item data with an open active context in an array', () => {
    json.items[0].data['@context'] = [
      openActiveContext,
    ];
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    rule.validate(node);
    rule.after(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.HAS_MODELLING_DATA);
  });

  it('should raise a suggestion when a node contains item data with an open active context in the string', () => {
    json.items[0].data = {};
    const node = new RpdeNode(
      url,
      json,
      log,
      1,
      false,
    );

    rule.validate(node);
    rule.after(node);

    expect(log.addPageError).toHaveBeenCalled();
    expect(log.pages.length).toBe(1);
    expect(log.pages[0].errors.length).toBe(1);
    expect(log.pages[0].errors[0].type).toBe(RpdeErrorType.NO_MODELLING_DATA);
  });
});
