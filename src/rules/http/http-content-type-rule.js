const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} = require('@openactive/data-model-validator');
const RpdeRule = require('../../rpde-rule');
const RpdeErrorType = require('../../errors/rpde-error-type');

const HttpContentTypeRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'HttpContentTypeRule',
      description: 'Validates that the Content-Type returned from the server is "application/json" or "application/vnd.openactive.booking+json"',
      tests: {
        default: {
          description: 'Raises a failure if the Content-Type returned from the server is not "application/json"',
          message: 'Response `Content-Type` should be `"application/json"` or `"application/vnd.openactive.rpde+json; version=1"`, actual type returned was `"{{contentType}}"`',
          sampleValues: {
            contentType: 'text/html',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_CONTENT_TYPE,
        },
        ordersFeed: {
          description: 'Raises a failure if the Content-Type returned from the server is not "application/vnd.openactive.booking+json" for an Orders feed',
          message: 'Response `Content-Type` should be `"application/vnd.openactive.booking+json; version=1"` for Open Booking API Orders Feeds, actual type returned was `"{{contentType}}"`',
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

    if (!node.isOrdersFeed) {
      if (!contentType.match(/^application\/json/) && !contentType.match(/^application\/vnd\.openactive\.rpde\+json/)) {
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
    } else if (!contentType.match(/^application\/vnd\.openactive\.booking\+json/)) {
      node.log.addPageError(
        node.url,
        this.createError(
          'ordersFeed',
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

module.exports = HttpContentTypeRule;
