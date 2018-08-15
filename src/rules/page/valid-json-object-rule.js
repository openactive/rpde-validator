import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from 'openactive-data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const ValidJsonObjectRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'ValidJsonObjectRule',
      description: 'Validates that the JSON returned by an RPDE feed is valid',
      tests: {
        default: {
          description: 'Raises a failure if the content is not valid JSON',
          message: '{{url}} did not return a valid JSON object',
          sampleValues: {
            url: 'http://example.org/feed.json',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_JSON,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object') {
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
          },
        ),
      );
    }
  }
};

export default ValidJsonObjectRule;
