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
        licenseInOrdersFeed: {
          description: 'Raises a failure if a license property is present at the root of an Orders feed',
          message: 'The `license` property must not be present in the Orders feed',
          sampleValues: {
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.FIELD_NOT_ALLOWED,
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
    ];

    // Only include license requirement for open RPDE feeds
    if (!node.isOrdersFeed) props.push('license');

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

    if (node.isOrdersFeed && typeof node.data.license !== 'undefined') {
      node.log.addPageError(
        node.url,
        this.createError(
          'licenseInOrdersFeed',
          {
            value: node.data,
            url: node.url,
          },
          {
            field: 'license',
          },
        ),
      );
    }
  }
};

export default RequiredPropertiesRule;
