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
      description: 'Validates that the Content-Type returned from the server is "application/json" or "application/vnd.openactive.booking+json"',
      tests: {
        default: {
          description: 'Raises a failure if the Content-Type returned from the server is not "application/json" or "application/vnd.openactive.booking+json"',
          message: 'Response `Content-Type` should be `"application/json"` or `"application/vnd.openactive.rpde+json; version=1"` (or "application/vnd.openactive.booking+json; version=1" for Open Booking API Orders Feeds), actual type returned was `"{{contentType}}"`',
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
    const { contentType } = node.data;
    if (!contentType.match(/^application\/json/) && !contentType.match(/^application\/vnd\.openactive\.rpde\+json/) && !contentType.match(/^application\/vnd\.openactive\.booking\+json/)) {
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
