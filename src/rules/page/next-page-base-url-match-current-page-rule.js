import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';
import UrlHelper from '../../helpers/url-helper';

const NextUrlBaseUrlMatchCurrentPage = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'NextUrlBaseUrlMatchCurrentPage',
      description: 'Validates that the base URL of the next parameter is equal to the base URL of the current page',
      tests: {
        default: {
          description: 'Raises a failure if the base URL of the next parameter is not equal to the base URL of the current page',
          message: 'The base URL of the `next` property `"{{nextBaseUrl}}"` must be equal to the base URL of the page `"{{currentBaseUrl}}"`.',
          sampleValues: {
            nextBaseUrl: 'http://example.com/',
            currentBaseUrl: 'https://example.com/',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.BASE_URL_MISMATCH,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object' || typeof node.data.next !== 'string' || !UrlHelper.isUrl(node.data.next) || node.url.indexOf('//') === -1 || node.data.next.indexOf('//') === -1) {
      return;
    }

    const getBaseUrl = url => url.substring(0, url.indexOf('/', url.indexOf('//') + 2));

    const baseUrlCurrentPage = getBaseUrl(node.url);
    const baseUrlNextPage = getBaseUrl(node.data.next);

    // The base URL of the next URL must always be equal to the base URL of the current page
    if (baseUrlCurrentPage !== baseUrlNextPage) {
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            value: node.data,
            url: node.url,
          },
          {
            currentBaseUrl: baseUrlCurrentPage,
            nextBaseUrl: baseUrlNextPage,
          },
        ),
      );
    }
  }
};

export default NextUrlBaseUrlMatchCurrentPage;
