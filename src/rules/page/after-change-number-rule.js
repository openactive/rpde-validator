import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import jp from 'jsonpath';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';
import UrlHelper from '../../helpers/url-helper';

class AfterChangeNumberRule extends RpdeRule {
  constructor() {
    super();
    this.lastTimestamp = null;
    this.meta = {
      name: 'AfterChangeNumberRule',
      description: 'If afterChangeNumber is used it must be an integer and "modified" must be an integer',
      tests: {
        default: {
          description: 'Raises a failure if "afterChangeNumber" isn\'t an integer',
          message: 'If afterChangeNumber is used, it must be an integer',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        modified: {
          description: 'Raises a failure if "afterChangeNumber" is used and "modified" isn\'t an integer',
          message: 'If afterChangeNumber is used, modified must also be an integer',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        increment: {
          description: 'Raises a failure if the afterChangeNumber doesn\'t increase with each new page',
          message: 'The afterChangeNumber of the next url should always increase with each new page',
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
      if (!node.isLastPage && node.pageIndex > 0 && afterChangeNumber <= this.lastChangeNumber) {
        node.log.addPageError(
          node.url,
          this.createError(
            'increment',
            {
              value: node.data,
              url: node.url,
            },
          ),
        );
      }
      this.lastChangeNumber = afterChangeNumber;
    }
  }
}

export default AfterChangeNumberRule;
