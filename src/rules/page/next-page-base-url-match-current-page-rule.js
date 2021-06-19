import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';
import UrlHelper from '../../helpers/url-helper';

const NextUrlBasePathMatchCurrentPage = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'NextUrlBasePathMatchCurrentPage',
      description: 'Validates that the bath path of the next parameter is equal to the bath path of the current page',
      tests: {
        default: {
          description: 'Raises a failure if the bath path of the next parameter is not equal to the bath path of the current page',
          message: 'The bath path of the `next` property `"{{nextBasePath}}"` must be equal to the bath path of the page `"{{currentBasePath}}"`.',
          sampleValues: {
            nextBasePath: 'http://example.com/',
            currentBasePath: 'https://example.com/',
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

    const getBasePath = url => url.split('?')[0];

    const basePathCurrentPage = getBasePath(node.url);
    const basePathNextPage = getBasePath(node.data.next);

    // The bath path of the next URL must always be equal to the bath path of the current page
    if (basePathCurrentPage !== basePathNextPage) {
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            value: node.data,
            url: node.url,
          },
          {
            currentBasePath: basePathCurrentPage,
            nextBasePath: basePathNextPage,
          },
        ),
      );
    }
  }
};

export default NextUrlBasePathMatchCurrentPage;
