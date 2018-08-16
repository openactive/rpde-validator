import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const NoLastPageItemsRule = class extends RpdeRule {
  constructor() {
    super();
    this.deletedItemsFound = false;
    this.meta = {
      name: 'NoLastPageItemsRule',
      description: 'Validates that the last page of the feed contains no items',
      tests: {
        default: {
          description: 'Raises a failure if items are found on the last page of the feed',
          message: 'The last page should not contain any items.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.LAST_PAGE_NO_ITEMS,
        },
      },
    };
  }

  validate(node) {
    if (node.data.items.length > 0) {
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            value: node.data,
            url: node.url,
          },
        ),
      );
    }
  }
};

export default NoLastPageItemsRule;
