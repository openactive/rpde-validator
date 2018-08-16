import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const MinimumItemsRule = class extends RpdeRule {
  constructor() {
    super();
    this.previousPageErrored = false;
    this.meta = {
      name: 'MinimumItemsRule',
      description: 'Validates that each page contains at least 500 items',
      tests: {
        default: {
          description: 'Raises a warning if a page contains fewer than 500 items',
          message: 'Pages should contain at least 500 items',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.MINIMUM_ITEMS_PER_PAGE,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object') {
      return;
    }
    if (!node.isLastPage && this.previousPageErrored) {
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

    this.previousPageErrored = false;

    // Pages should contain at least 500 items (this is a warning rather than an error)
    if (node.data.items.length < 500 && !node.isLastPage) {
      this.previousPageErrored = true;
    }
  }
};

export default MinimumItemsRule;
