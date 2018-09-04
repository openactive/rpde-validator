import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const RequiredPropertiesRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'RequiredPropertiesRule',
      description: 'Validates that the feed contains required properties',
      tests: {
        default: {
          description: 'Raises a failure if a required property is missing at the root of the feed',
          message: 'Required property [`{{field}}`](https://www.openactive.io/realtime-paged-data-exchange/#-response-) is missing from the feed.',
          sampleValues: {
            field: 'license',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.MISSING_REQUIRED_FIELD,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object') {
      return;
    }

    const props = [
      'next',
      'items',
      'license',
    ];

    for (const prop of props) {
      if (typeof node.data[prop] === 'undefined') {
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
            },
          ),
        );
      }
    }
  }
};

export default RequiredPropertiesRule;
