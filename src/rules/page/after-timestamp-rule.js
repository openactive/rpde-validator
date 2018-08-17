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
    this.lastId = null;
    this.lastTimestamp = null;
    this.meta = {
      name: 'AfterTimestampRule',
      description: 'If afterTimestamp is used, and "modified" is an integer, afterTimestamp must also be an integer.',
      tests: {
        default: {
          description: 'Raises a failure if "modified" is an integer but "afterTimestamp" isn\'t.',
          message: 'If afterTimestamp is used, and "modified" is an integer, afterTimestamp must also be an integer.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        timestampInteger: {
          description: 'Raises a warning if "afterTimestamp" isn\'t an integer',
          message: 'If possible, when afterTimestamp is used it should be an integer. Whilst this isn\'t mandated in the specification, it is recommended that both afterTimestamp and modified are integers to be compatible with future version of RPDE.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.INVALID_TYPE,
        },
        modifiedInteger: {
          description: 'Raises a warning if "modified" isn\'t an integer',
          message: 'If possible, when afterTimestamp is used, modified should be an integer. Whilst this isn\'t mandated in the specification, it is recommended that both afterTimestamp and modified are integers to be compatible with future version of RPDE.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.INVALID_TYPE,
        },
        modifiedStringInteger: {
          description: 'Raises an error if "modified" is a string representation of an integer',
          message: 'When modified is an integer, it should not be presented as a string.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        increment: {
          description: 'Raises a failure if the afterTimestamp doesn\'t increase with each new page.',
          message: 'The afterTimestamp of the next url should always increase with each new page.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.AFTER_PARAM_SHOULD_INCREASE,
        },
        afterId: {
          description: 'Raises a failure if afterId isn\'t present when afterTimestamp is.',
          message: 'If afterTimestamp is used, afterId should be present too.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.AFTER_ID_WITH_TIMESTAMP,
        },
        afterIdAlternative: {
          description: 'Raises a failure if afterId isn\'t present when afterTimestamp is, presenting an alternative error if afterID is present.',
          message: 'If afterTimestamp is used, afterId should be present too. "afterID" should be corrected to "afterId".',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.AFTER_ID_WITH_TIMESTAMP,
        },
      },
    };
  }

  validate(node) {
    if (
      typeof node.data !== 'object'
    ) {
      return;
    }
    const afterTimestamp = UrlHelper.getParam('afterTimestamp', node.data.next, node.url);
    const afterId = UrlHelper.getParam('afterId', node.data.next, node.url);
    if (afterTimestamp !== null) {
      const modified = jp.query(node.data, '$.items[0].modified');
      if (modified.length !== 0) {
        if (
          typeof modified[0] === 'number'
          || modified[0].match(/^[1-9][0-9]*$/)
        ) {
          if (
            typeof modified[0] === 'string'
            && modified[0].match(/^[1-9][0-9]*$/)
          ) {
            node.log.addPageError(
              node.url,
              this.createError(
                'modifiedStringInteger',
                {
                  value: node.data,
                  url: node.url,
                },
              ),
            );
          }
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
        } else {
          node.log.addPageError(
            node.url,
            this.createError(
              'modifiedInteger',
              {
                value: node.data,
                url: node.url,
              },
            ),
          );
          if (!afterTimestamp.match(/^[1-9][0-9]*$/)) {
            node.log.addPageError(
              node.url,
              this.createError(
                'timestampInteger',
                {
                  value: node.data,
                  url: node.url,
                },
              ),
            );
          }
        }
      } else if (!afterTimestamp.match(/^[1-9][0-9]*$/)) {
        node.log.addPageError(
          node.url,
          this.createError(
            'timestampInteger',
            {
              value: node.data,
              url: node.url,
            },
          ),
        );
      }
      if (afterId === null) {
        let afterKey = 'afterId';
        if (UrlHelper.getParam('afterID', node.data.next, node.url) !== null) {
          afterKey = 'afterIdAlternative';
        }
        node.log.addPageError(
          node.url,
          this.createError(
            afterKey,
            {
              value: node.data,
              url: node.url,
            },
          ),
        );
      }

      const compare = {
        afterTimestamp,
        lastTimestamp: this.lastTimestamp,
        afterId,
        lastId: this.lastId,
      };

      for (const key in compare) {
        if (Object.prototype.hasOwnProperty.call(compare, key)) {
          if (
            typeof compare[key] === 'string'
            && compare[key].match(/^[1-9][0-9]*$/)
          ) {
            compare[key] *= 1;
          }
        }
      }
      if (
        !node.isLastPage
        && node.pageIndex > 0
        && (
          compare.afterTimestamp < compare.lastTimestamp
          || (
            compare.afterTimestamp === compare.lastTimestamp
            && compare.afterId <= compare.lastId
          )
        )
      ) {
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
      this.lastTimestamp = compare.afterTimestamp;
      this.lastId = compare.afterId;
    }
  }
}

export default AfterTimestampRule;
