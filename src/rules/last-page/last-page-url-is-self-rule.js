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
          message: 'The last page `next` URL must point to itself. See the [last page definition](https://www.openactive.io/realtime-paged-data-exchange/#last-page-definition) for more details.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.LAST_PAGE_REFERENCE_SELF,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.previousNode !== 'undefined') {
      if (
        typeof node.data !== 'undefined'
        && typeof node.previousNode.data !== 'undefined'
        && JSON.stringify(node.data) !== JSON.stringify(node.previousNode.data)
      ) {
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
