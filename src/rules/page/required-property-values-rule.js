const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} = require('@openactive/data-model-validator');
const RpdeRule = require('../../rpde-rule');
const RpdeErrorType = require('../../errors/rpde-error-type');

const RequiredPropertyValuesRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'RequiredPropertyValuesRule',
      description: 'Validates that the feed properties conform to the correct format',
      tests: {
        state: {
          description: 'Raises a failure if the `state` property isn\'t one of "updated" or "deleted"',
          message: 'The [`state` property](https://www.openactive.io/realtime-paged-data-exchange/#-state-) must be of value "updated" or "deleted", but was found to be different in {{count}} items in the feed.',
          sampleValues: {
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_FORMAT,
        },
        id: {
          description: 'Raises a failure if the `id` property isn\'t a string or an integer in any item',
          message: 'The [`id` property](https://www.openactive.io/realtime-paged-data-exchange/#-id-) must be a string, but was found to be different in {{count}} items in the feed.',
          sampleValues: {
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_FORMAT,
        },
        kind: {
          description: 'Raises a failure if the `kind` property isn\'t a string in any item',
          message: 'The [`kind` property](https://www.openactive.io/realtime-paged-data-exchange/#-kind-) must be a string, but was found to be different in {{count}} items in the feed.',
          sampleValues: {
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_FORMAT,
        },
        data: {
          description: 'Raises a failure if the `data` property isn\'t an object in any item',
          message: 'The [`data` property](https://www.openactive.io/realtime-paged-data-exchange/#-data-) must be an object, but was found to be different in {{count}} items in the feed.',
          sampleValues: {
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_FORMAT,
        },
        item: {
          description: 'Raises a failure if an item is found that isn\'t an object',
          message: 'Items must be objects, but were found to be different in {{count}} items in the feed.',
          sampleValues: {
            count: 23,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_FORMAT,
        },
        items: {
          description: 'Raises a failure if the items property isn\'t an array',
          message: 'Required property [`items`](https://www.openactive.io/realtime-paged-data-exchange/#-response-) must be an array, but was found to be "{{type}}".',
          sampleValues: {
            type: 'string',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_FORMAT,
        },
        license: {
          description: 'Raises a failure if the license property isn\'t a string',
          message: 'Required property [`license`](https://www.openactive.io/realtime-paged-data-exchange/#-response-) must be a string, but was found to be "{{type}}".',
          sampleValues: {
            type: 'object',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  validate(node) {
    if (
      typeof node.data.items !== 'undefined'
      && (
        typeof node.data.items !== 'object'
        || !(node.data.items instanceof Array)
      )
    ) {
      // Items must be an array
      node.log.addPageError(
        node.url,
        this.createError(
          'items',
          {
            value: node.data,
            url: node.url,
          },
          {
            type: typeof node.data.items,
          },
        ),
      );
    }

    if (
      typeof node.data.license !== 'undefined'
      && typeof node.data.license !== 'string'
    ) {
      // License must be a string
      node.log.addPageError(
        node.url,
        this.createError(
          'license',
          {
            value: node.data,
            url: node.url,
          },
          {
            type: typeof node.data.license,
          },
        ),
      );
    }

    const invalidProps = {
      state: 0,
      kind: 0,
      item: 0,
      id: 0,
      data: 0,
    };

    if (node.data.items instanceof Array) {
      for (const item of node.data.items) {
        if (
          typeof item !== 'object'
          || item instanceof Array
        ) {
          invalidProps.item += 1;
        }
        if (
          typeof item.state !== 'undefined'
          && (
            typeof item.state !== 'string'
            || (
              item.state !== 'deleted'
              && item.state !== 'updated'
            )
          )
        ) {
          invalidProps.state += 1;
        }
        if (
          typeof item.kind !== 'undefined'
          && typeof item.kind !== 'string'
        ) {
          invalidProps.kind += 1;
        }
        if (
          typeof item.id !== 'undefined'
          && typeof item.id !== 'string' && typeof item.id !== 'number'
        ) {
          invalidProps.id += 1;
        }
        if (
          typeof item.data !== 'undefined'
          && (typeof item.data !== 'object' || item.data instanceof Array)
        ) {
          invalidProps.data += 1;
        }
      }
    }

    for (const prop in invalidProps) {
      if (
        Object.prototype.hasOwnProperty.call(invalidProps, prop)
        && invalidProps[prop] > 0
      ) {
        node.log.addPageError(
          node.url,
          this.createError(
            prop,
            {
              value: node.data,
              url: node.url,
            },
            {
              count: invalidProps[prop],
            },
          ),
        );
      }
    }
  }
};

module.exports = RequiredPropertyValuesRule;
