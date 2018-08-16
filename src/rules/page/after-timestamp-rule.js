import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import jp from 'jsonpath';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';
import UrlHelper from '../../helpers/url-helper';

class AfterTimestampRule extends RpdeRule {
  constructor() {
    super();
    this.lastTimestamp = null;
    this.meta = {
      name: 'AfterTimestampRule',
      description: 'If afterTimestamp is used, and "modified" is an integer, afterTimestamp must also be an integer',
      tests: {
        default: {
          description: 'Raises a failure if "modified" is an integer but "afterTimestamp" isn\'t',
          message: 'If afterTimestamp is used, and "modified" is an integer, afterTimestamp must also be an integer',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        increment: {
          description: 'Raises a failure if the afterTimestamp doesn\'t increase with each new page',
          message: 'The afterTimestamp of the next url should always increase with each new page',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.AFTER_PARAM_SHOULD_INCREASE,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object') {
      return;
    }
    const afterTimestamp = UrlHelper.getParam('afterTimestamp', node.data.next, node.url);
    if (afterTimestamp !== null) {
      const modified = jp.query(node.data, '$.items[0].modified');
      if (typeof modified === 'number') {
        if (!afterTimestamp.match(/^[1-9][0-9]*$/)) {
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
      }
      if (!node.isLastPage && node.pageIndex > 0 && afterTimestamp <= this.lastTimestamp) {
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
      this.lastTimestamp = afterTimestamp;
    }
  }
}

export default AfterTimestampRule;
