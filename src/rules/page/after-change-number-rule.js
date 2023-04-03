const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} = require('@openactive/data-model-validator');
const jp = require('jsonpath');
const RpdeRule = require('../../rpde-rule');
const RpdeErrorType = require('../../errors/rpde-error-type');
const UrlHelper = require('../../helpers/url-helper');

class AfterChangeNumberRule extends RpdeRule {
  constructor() {
    super();
    this.lastChangeNumber = null;
    this.meta = {
      name: 'AfterChangeNumberRule',
      description: 'If afterChangeNumber is used it must be an integer and "modified" must be an integer',
      tests: {
        default: {
          description: 'Raises a failure if "afterChangeNumber" isn\'t an integer',
          message: 'When using the [Incrementing Unique Change Number Ordering Strategy](https://www.openactive.io/realtime-paged-data-exchange/#incrementing-unique-change-number), the parameter `afterChangeNumber` must be an integer.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        modified: {
          description: 'Raises a failure if "afterChangeNumber" is used and "modified" isn\'t an integer',
          message: 'When using the [Incrementing Unique Change Number Ordering Strategy](https://www.openactive.io/realtime-paged-data-exchange/#incrementing-unique-change-number), `modified` must be an integer.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        increment: {
          description: 'Raises a failure if the afterChangeNumber doesn\'t increase with each new page',
          message: 'When using the [Incrementing Unique Change Number Ordering Strategy](https://www.openactive.io/realtime-paged-data-exchange/#incrementing-unique-change-number), the `afterChangeNumber` in the next url must always increase with each new page, as the primary query sorts by the change number (the `modified` property). The next URL of this page is "{{url}}".',
          sampleValues: {
            url: 'https://example.org/feed',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.AFTER_PARAM_SHOULD_INCREASE,
        },
      },
    };
  }

  validate(node) {
    if (
      typeof node.data !== 'object'
      || node.isLastPage
    ) {
      return;
    }
    const lastChangeNumber = UrlHelper.getParam('afterChangeNumber', node.url) || this.lastChangeNumber;
    const afterChangeNumber = UrlHelper.getParam('afterChangeNumber', node.data.next, node.url);
    if (afterChangeNumber !== null) {
      const modified = jp.query(node.data, '$.items[0].modified');
      if (
        modified.length === 0
        || (
          typeof modified[0] !== 'number'
          && !modified[0].match(/^[1-9][0-9]*$/)
        )
      ) {
        node.log.addPageError(
          node.url,
          this.createError(
            'modified',
            {
              value: node.data,
              url: node.url,
            },
          ),
        );
      }
      if (!afterChangeNumber.match(/^[1-9][0-9]*$/)) {
        node.log.addPageError(
          node.url,
          this.createError(
            'default',
            {
              value: node.data,
              url: node.url,
            },
          ),
        );
      }
      let compareAfterChangeNumber = afterChangeNumber;
      let compareLastChangeNumber = lastChangeNumber;
      if (
        typeof compareAfterChangeNumber === 'string'
        && compareAfterChangeNumber.match(/^[1-9][0-9]*$/)
      ) {
        compareAfterChangeNumber *= 1;
      }
      if (
        typeof compareLastChangeNumber === 'string'
        && compareLastChangeNumber.match(/^[1-9][0-9]*$/)
      ) {
        compareLastChangeNumber *= 1;
      }
      if (!node.isLastPage && node.pageIndex > 0 && compareAfterChangeNumber <= compareLastChangeNumber) {
        node.log.addPageError(
          node.url,
          this.createError(
            'increment',
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
      this.lastChangeNumber = afterChangeNumber;
    }
  }
}

module.exports = AfterChangeNumberRule;
