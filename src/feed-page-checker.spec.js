import FeedPageChecker from './feed-page-checker.js';
import RpdeErrorType from './errors/rpde-error-type.js';

describe('FeedPageChecker', () => {
  let checker;

  const examplePage = {
    next: 'https://www.example.com/api/rpde/sessions?afterTimestamp=1521565719&afterId=1402CBP20150217',
    items: [
      {
        state: 'updated',
        kind: 'SessionSeries.ScheduledSession',
        id: '1402CBP20150217',
        modified: 1521565719,
        data: {
          '@context': 'https://openactive.io/',
        },
      },
    ],
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  const exampleInvalidState = {
    next: 'https://www.example.com/api/rpde/sessions?afterTimestamp=1521565719&afterId=1402CBP20150217',
    items: [
      {
        state: 'changed',
        kind: 'SessionSeries.ScheduledSession',
        id: '1402CBP20150217',
        modified: 1521565719,
        data: {
          '@context': 'https://openactive.io/',
        },
      },
    ],
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  const exampleLastPage = {
    next: 'https://www.example.com/api/rpde/sessions?afterTimestamp=1521565719&afterId=1402CBP20150217',
    items: [],
    license: 'https://creativecommons.org/licenses/by/4.0/',
  };

  beforeEach(() => {
    checker = new FeedPageChecker();
  });

  it('should raise no error with valid first RPDE page', () => {
    const errors = checker.validateRpdePage({
      url: 'https://www.example.com/api/rpde/sessions',
      json: examplePage,
      pageIndex: 0,
      contentType: 'application/json',
      status: 200,
    });

    expect(errors.length).toBe(0);
  });

  it('should raise no error with valid last RPDE page', () => {
    const errors = checker.validateRpdePage({
      url: 'https://www.example.com/api/rpde/sessions?afterTimestamp=1521565719&afterId=1402CBP20150217',
      json: exampleLastPage,
      pageIndex: 10,
      contentType: 'application/json',
      status: 200,
    });

    expect(errors.length).toBe(0);
  });

  it('should raise an error with invalid content type', () => {
    const errors = checker.validateRpdePage({
      url: 'https://www.example.com/api/rpde/sessions?afterTimestamp=1521565719&afterId=1402CBP20150217',
      json: '<html></html>',
      pageIndex: 10,
      contentType: 'text/html',
      status: 200,
    });

    expect(errors.length).toBe(2);
    expect(errors[0].type).toBe(RpdeErrorType.INVALID_CONTENT_TYPE);
    expect(errors[1].type).toBe(RpdeErrorType.INVALID_JSON);
  });

  it('should raise an error with invalid content type for an Orders feed with content-type `application/json`', () => {
    const errors = checker.validateRpdePage({
      url: 'https://www.example.com/api/rpde/sessions?afterTimestamp=1521565719&afterId=1402CBP20150217',
      json: '<html></html>',
      pageIndex: 10,
      contentType: 'application/json',
      status: 200,
      isOrdersFeed: true,
    });

    expect(errors.length).toBe(2);
    expect(errors[0].type).toBe(RpdeErrorType.INVALID_CONTENT_TYPE);
    expect(errors[1].type).toBe(RpdeErrorType.INVALID_JSON);
  });

  it('should raise an error with invalid status', () => {
    const errors = checker.validateRpdePage({
      url: 'https://www.example.com/api/rpde/sessions?afterTimestamp=1521565719&afterId=1402CBP20150217',
      json: exampleLastPage,
      pageIndex: 10,
      contentType: 'application/json',
      status: 404,
    });

    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(RpdeErrorType.INVALID_STATUS_CODE);
  });

  it('should raise an error with invalid state value', () => {
    const errors = checker.validateRpdePage({
      url: 'https://www.example.com/api/rpde/sessions',
      json: exampleInvalidState,
      pageIndex: 0,
      contentType: 'application/json',
      status: 200,
    });

    expect(errors.length).toBe(1);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(RpdeErrorType.INVALID_FORMAT);
  });
});
