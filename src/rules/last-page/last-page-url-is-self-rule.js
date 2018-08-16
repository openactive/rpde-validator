import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const LastPageUrlIsSelfRule = class extends RpdeRule {
  constructor() {
    super();
    this.deletedItemsFound = false;
    this.meta = {
      name: 'LastPageUrlIsSelfRule',
      description: 'Validates that the last page of the feed references itself in the "next" url',
      tests: {
        default: {
          description: 'Raises a failure if the last page "next" url points to a different page',
          message: 'The last page next URL should point to itself.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.LAST_PAGE_REFERENCE_SELF,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.previousNode !== 'undefined') {
      if (JSON.stringify(node.data) !== JSON.stringify(node.previousNode.data)) {
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
  }
};

export default LastPageUrlIsSelfRule;
