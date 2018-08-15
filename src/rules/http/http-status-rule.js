import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from 'openactive-data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const HttpStatusRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'HttpStatusRule',
      description: 'Validates that the response code from the server is 200',
      tests: {
        default: {
          description: 'Raises a failure if the response code from the server is not 200',
          message: 'HTTP status code should be 200, actual code returned was {{status}}',
          sampleValues: {
            status: 500,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_STATUS_CODE,
        },
      },
    };
  }

  validate(node) {
    if (node.data.status !== 200) {
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            value: node.data,
            url: node.url,
          },
          {
            status: node.data.status,
          },
        ),
      );
    }
  }
};

export default HttpStatusRule;
