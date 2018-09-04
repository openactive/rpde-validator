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
    this.previousPageUrl = null;
    this.meta = {
      name: 'MinimumItemsRule',
      description: 'Validates that each page contains at least 500 items',
      tests: {
        default: {
          description: 'Raises a warning if a page contains fewer than 500 items',
          message: 'Pages should contain at least 500 items to optimise the number of pages that a data consumer needs to download. Note this is only a recommendation, and actual default limit should be based on query performance.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.MINIMUM_ITEMS_PER_PAGE,
        },
      },
    };
  }

  validate(node) {
    if (!node.isLastPage && this.previousPageErrored) {
      node.log.addPageError(
        this.previousPageUrl,
        this.createError(
          'default',
          {
            value: node.data,
            url: this.previousPageUrl,
          },
        ),
      );
    }

    this.previousPageErrored = false;
    this.previousPageUrl = null;

    if (
      typeof node.data !== 'object'
      || typeof node.data.items !== 'object'
      || !(node.data.items instanceof Array)
    ) {
      return;
    }

    // Pages should contain at least 500 items (this is a warning rather than an error)
    if (node.data.items.length < 500 && !node.isLastPage) {
      this.previousPageErrored = true;
      this.previousPageUrl = node.url;
    }
  }

  after(node) {
    if (!node.isLastPage && this.previousPageErrored) {
      node.log.addPageError(
        this.previousPageUrl,
        this.createError(
          'default',
          {
            value: node.data,
            url: this.previousPageUrl,
          },
        ),
      );
    }
  }
};

export default MinimumItemsRule;
