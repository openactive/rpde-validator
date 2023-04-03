const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} = require('@openactive/data-model-validator');
const RpdeRule = require('../../rpde-rule');
const RpdeErrorType = require('../../errors/rpde-error-type');
const UrlHelper = require('../../helpers/url-helper');

const NextPageValidRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'NextPageValidRule',
      description: 'Validates that the next parameter is a valid URL',
      tests: {
        default: {
          description: 'Raises a failure if the next parameter is not a valid URL',
          message: 'The `next` property `"{{url}}"` should be a valid absolute URL',
          sampleValues: {
            url: '/feed.json',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object') {
      return;
    }

    // The next URL must be an absolute not relative URL
    if (
      typeof node.data.next !== 'string'
      || !UrlHelper.isUrl(node.data.next)
    ) {
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            value: node.data,
            url: node.url,
          },
          {
            url: node.data.next,
          },
        ),
      );
    }
  }
};

module.exports = NextPageValidRule;
