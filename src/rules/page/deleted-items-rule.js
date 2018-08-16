import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import jp from 'jsonpath';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const DeletedItemsRule = class extends RpdeRule {
  constructor() {
    super();
    this.deletedItemsFound = false;
    this.meta = {
      name: 'DeletedItemsRule',
      description: 'Validates that the feed contains at least one deleted item',
      tests: {
        default: {
          description: 'Raises a warning if no deleted items are found at any point in the feed',
          message: 'No deleted items detected. Please check that deleted items have been implemented correctly.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.NO_DELETED_ITEMS,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object') {
      return;
    }
    if (!this.deletedItemsFound) {
      const deleted = jp.query(node.data, '$..items[?(@.state=="deleted")]');
      if (deleted.length > 0) {
        this.deletedItemsFound = true;
      }
    }
  }

  after(node) {
    if (!this.deletedItemsFound) {
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

export default DeletedItemsRule;
