import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

const HttpContentTypeRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'HttpContentTypeRule',
      description: 'Validates that the response code from the server is 200',
      tests: {
        default: {
          description: 'Raises a failure if the response code from the server is not 200',
          message: 'Document content type should be "application/json", actual type returned was "{{contentType}}"',
          sampleValues: {
            contentType: 'text/html',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_CONTENT_TYPE,
        },
      },
    };
  }

  validate(node) {
    const contentType = node.data.headers.get('content-type');
    if (!contentType.match(/^application\/json/)) {
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            value: node.data,
            url: node.url,
          },
          {
            contentType,
          },
        ),
      );
    }
  }
};

export default HttpContentTypeRule;
