import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

const RequiredItemPropertiesRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'RequiredItemPropertiesRule',
      description: 'Validates that the feed contains required properties',
      tests: {
        default: {
          description: 'Raises a failure if a required property is missing at from any of the items',
          message: 'Required property [`{{field}}`](https://www.openactive.io/realtime-paged-data-exchange/#-item-) is missing from {{count}} items in the feed.',
          sampleValues: {
            field: 'id',
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.MISSING_REQUIRED_FIELD,
        },
        missingData: {
          description: 'Raises a failure if the data property is missing on an updated item',
          message: 'The [`data` property](https://www.openactive.io/realtime-paged-data-exchange/#-item-) must be present on "updated" items, but was missing in {{count}} "updated" items in the feed.',
          sampleValues: {
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.MISSING_DATA_IN_UPDATED_ITEM,
        },
        unnecessaryData: {
          description: 'Raises a failure if the data property is present on a deleted item',
          message: 'The [`data` property](https://www.openactive.io/realtime-paged-data-exchange/#-item-) must not be present on "deleted" items, but was found in {{count}} "deleted" items in the feed.',
          sampleValues: {
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.UNNECESSARY_DATA_IN_DELETED_ITEM,
        },
      },
    };
  }

  validate(node) {
    if (
      typeof node.data !== 'object'
      || typeof node.data.items !== 'object'
      || !(node.data.items instanceof Array)
    ) {
      return;
    }

    const props = [
      'state',
      'kind',
      'id',
      'modified',
    ];

    const missingProps = {};
    let missingDataCount = 0;
    let unnecessaryDataCount = 0;

    for (const item of node.data.items) {
      const testProps = props.slice();
      for (const prop of testProps) {
        if (typeof item[prop] === 'undefined') {
          if (typeof missingProps[prop] === 'undefined') {
            missingProps[prop] = 0;
          }
          missingProps[prop] += 1;
        }
      }
      if (
        item.state === 'updated'
        && typeof item.data === 'undefined'
      ) {
        missingDataCount += 1;
      }
      if (
        item.state === 'deleted'
        && typeof item.data !== 'undefined'
      ) {
        unnecessaryDataCount += 1;
      }
    }

    for (const prop in missingProps) {
      if (Object.prototype.hasOwnProperty.call(missingProps, prop)) {
        node.log.addPageError(
          node.url,
          this.createError(
            'default',
            {
              value: node.data,
              url: node.url,
            },
            {
              field: prop,
              count: missingProps[prop],
            },
          ),
        );
      }
    }

    if (missingDataCount > 0) {
      node.log.addPageError(
        node.url,
        this.createError(
          'missingData',
          {
            value: node.data,
            url: node.url,
          },
          {
            count: missingDataCount,
          },
        ),
      );
    }
    if (unnecessaryDataCount > 0) {
      node.log.addPageError(
        node.url,
        this.createError(
          'unnecessaryData',
          {
            value: node.data,
            url: node.url,
          },
          {
            count: unnecessaryDataCount,
          },
        ),
      );
    }
  }
};

export default RequiredItemPropertiesRule;
