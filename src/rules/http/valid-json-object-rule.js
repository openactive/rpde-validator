import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

const ValidJsonObjectRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'ValidJsonObjectRule',
      description: 'Validates that the JSON returned by an RPDE feed is valid',
      tests: {
        default: {
          description: 'Raises a failure if the content is not valid JSON',
          message: '{{url}} did not return a valid JSON object. The JSON parser returned the following message: "{{error}}"',
          sampleValues: {
            url: 'http://example.org/feed.json',
            error: 'SyntaxError: Unexpected token , in JSON at position 273',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_JSON,
        },
      },
    };
  }

  validate(node) {
    let data;
    let error;
    try {
      data = typeof node.data.body === 'object' ? node.data.body : JSON.parse(node.data.body);
    } catch (e) {
      error = `${e.name}: ${e.message}`;
      data = null;
    }
    if (typeof data !== 'object' || data === null) {
      if (typeof error === 'undefined') {
        if (typeof data !== 'object') {
          error = `Returned data is of type "${typeof data}", should be of type "object"`;
        } else {
          error = 'Returned data is null, should be a populated object';
        }
      }
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            value: node.data,
            url: node.url,
          },
          {
            url: node.url,
            error,
          },
        ),
      );
    }
  }
};

export default ValidJsonObjectRule;
