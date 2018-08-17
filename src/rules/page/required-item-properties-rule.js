import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const RequiredItemPropertiesRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'RequiredItemPropertiesRule',
      description: 'Validates that the feed contains required properties',
      tests: {
        default: {
          description: 'Raises a failure if a required field is missing at from any of the items',
          message: 'Required field "{{field}}" is missing from {{count}} items in the feed.',
          sampleValues: {
            field: 'id',
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.MISSING_REQUIRED_FIELD,
        },
        noData: {
          description: 'Raises a failure if the data field is present on a deleted item',
          message: 'Field "data" should not be present on deleted items, but was found in {{count}} items in the feed.',
          sampleValues: {
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.NO_DATA_IN_DELETED_ITEM,
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
    let noDataCount = 0;

    for (const item of node.data.items) {
      const testProps = props.slice();
      if (
        typeof item.state !== 'undefined'
        && item.state === 'updated'
      ) {
        testProps.push('data');
      }
      for (const prop of testProps) {
        if (typeof item[prop] === 'undefined') {
          if (typeof missingProps[prop] === 'undefined') {
            missingProps[prop] = 0;
          }
          missingProps[prop] += 1;
        }
      }
      if (
        typeof item.state !== 'undefined'
        && item.state === 'deleted'
        && typeof item.data !== 'undefined'
      ) {
        noDataCount += 1;
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

    if (noDataCount > 0) {
      node.log.addPageError(
        node.url,
        this.createError(
          'noData',
          {
            value: node.data,
            url: node.url,
          },
          {
            count: noDataCount,
          },
        ),
      );
    }
  }
};

export default RequiredItemPropertiesRule;
