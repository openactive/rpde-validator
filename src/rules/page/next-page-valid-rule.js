import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from 'openactive-data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';
import UrlHelper from '../../helpers/url-helper';

const NextPageValidRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'NextPageValidRule',
      description: 'Validates that the next parameter is a valid URL',
      tests: {
        default: {
          description: 'Raises a failure if the next parameter is not a valid URL',
          message: 'Next page parameter "{{url}}" should be a valid URL',
          sampleValues: {
            url: 'http://example.org/feed.json',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
      },
    };
  }

  validate(node) {
    // The next URL should be an absolute not relative URL
    const nextUrlRaw = UrlHelper.deriveUrl(node.data.next, node.url);

    if (!UrlHelper.isUrl(nextUrlRaw)) {
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

export default NextPageValidRule;
