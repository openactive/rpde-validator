import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const NextPageNotCurrentPageRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'NextPageNotCurrentPageRule',
      description: 'Validates that the next parameter is not equal to the current page URL if there are more than zero items',
      tests: {
        default: {
          description: 'Raises a failure if the next parameter is equal to the current page URL where there are more than zero items',
          message: 'The `next` property `"{{nextUrl}}"` must not be equal to the current page URL `"{{currentUrl}}"` where there are more than zero `items` in the page. The last item in each page must be used to generate the `next` URL.',
          sampleValues: {
            currentUrl: '/feed.json',
            nextUrl: '/feed.json',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_NEXT_URL_FOR_ZERO_ITEMS,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object') {
      return;
    }

    if (
      typeof node.data !== 'object'
      || typeof node.data.items !== 'object'
      || !(node.data.items instanceof Array)
    ) {
      return;
    }

    // The next URL must not be equal to the current URL if there are no items in the page
    if (node.data.items.length !== 0 && node.data.next === node.url) {
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            value: node.data,
            url: node.url,
          },
          {
            currentUrl: node.url,
            nextUrl: node.data.next,
          },
        ),
      );
    }
  }
};

export default NextPageNotCurrentPageRule;
