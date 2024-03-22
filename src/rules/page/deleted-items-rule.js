const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} = require('@openactive/data-model-validator');
const _ = require('lodash');
const RpdeRule = require('../../rpde-rule');
const RpdeErrorType = require('../../errors/rpde-error-type');

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
      const hasDeleted = _.isArray(node.data.items) && node.data.items.some((item) => item.state === 'deleted');
      if (hasDeleted) {
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

module.exports = DeletedItemsRule;
