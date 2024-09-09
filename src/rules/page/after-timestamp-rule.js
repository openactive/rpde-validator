const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} = require('@openactive/data-model-validator');
const _ = require('lodash');
const RpdeRule = require('../../rpde-rule');
const RpdeErrorType = require('../../errors/rpde-error-type');
const UrlHelper = require('../../helpers/url-helper');

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
          message: 'When using the [Modified Timestamp and ID Ordering Strategy](https://www.openactive.io/realtime-paged-data-exchange/#modified-timestamp-and-id), the `afterTimestamp` parameter and `modified` property must reference the same set of values in the same format. Please correct `afterTimestamp` to be an integer.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        timestampInteger: {
          description: 'Raises a warning if "afterTimestamp" isn\'t an integer',
          message: 'When using the [Modified Timestamp and ID Ordering Strategy](https://www.openactive.io/realtime-paged-data-exchange/#modified-timestamp-and-id), `afterTimestamp` should be an integer. Whilst this isn\'t mandated in the specification, it is recommended that both `afterTimestamp` and `modified` are integers to be compatible with future versions of RPDE.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.INVALID_TYPE,
        },
        modifiedInteger: {
          description: 'Raises a warning if "modified" isn\'t an integer',
          message: 'If possible, when `afterTimestamp` is used, `modified` should be an integer. Whilst this isn\'t mandated in the specification, it is recommended that both `afterTimestamp` and `modified` are integers to be compatible with future version of RPDE.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.INVALID_TYPE,
        },
        modifiedStringInteger: {
          description: 'Raises an error if "modified" is a string representation of an integer',
          message: 'When `modified` is an integer, it must not be presented as a string. Please ensure the value for `modified` is a JSON number.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.INVALID_TYPE,
        },
        increment: {
          description: 'Raises a failure if the afterTimestamp doesn\'t increase with each new page.',
          message: 'When using the [Modified Timestamp and ID Ordering Strategy](https://www.openactive.io/realtime-paged-data-exchange/#modified-timestamp-and-id), the combination of `afterTimestamp` and `afterId` in the next url must always increase with each new page, as the primary query sorts first by `modified` and then by `id`. The next URL of this page is "{{url}}"',
          sampleValues: {
            url: 'https://example.org/feed',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.AFTER_PARAM_SHOULD_INCREASE,
        },
        afterId: {
          description: 'Raises a failure if afterId isn\'t present when afterTimestamp is.',
          message: 'When using the [Modified Timestamp and ID Ordering Strategy](https://www.openactive.io/realtime-paged-data-exchange/#modified-timestamp-and-id), if the parameter `afterTimestamp` is present, then `afterId` must also be present.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.AFTER_ID_WITH_TIMESTAMP,
        },
        afterIdAlternative: {
          description: 'Raises a failure if afterId isn\'t present when afterTimestamp is, presenting an alternative error if a misspelling of afterId is present.',
          message: 'The parameter `"{{misspelling}}"` is a common misspelling of `afterId`. Please update it to `afterId`.',
          sampleValues: {
            misspelling: 'afterID',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.AFTER_ID_WITH_TIMESTAMP,
        },
        lastItemMatch: {
          description: 'Raises a failure if the last item of a feed hasn\'t been used to construct the `next` URL property.',
          message: '`id` and `modified` values of the last item in the page do not match those in the `next` URL. The last item in each page must be used to generate the `next` URL.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.LAST_ITEM_NOT_MATCHING_NEXT,
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
    const lastTimestamp = UrlHelper.getParam('afterTimestamp', node.url) || this.lastTimestamp;
    const lastId = UrlHelper.getParam('afterId', node.url) || this.lastId;
    const afterTimestamp = UrlHelper.getParam('afterTimestamp', node.data.next, node.url);
    const afterId = UrlHelper.getParam('afterId', node.data.next, node.url);
    if (afterTimestamp !== null) {
      const modified = _.get(node.data, 'items[0].modified');
      if (modified !== undefined && modified !== null && modified.length !== 0) {
        if (
          typeof modified === 'number'
          || (typeof modified === 'string' && modified.match(/^[1-9][0-9]*$/))
        ) {
          if (
            typeof modified === 'string'
            && modified.match(/^[1-9][0-9]*$/)
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
          if (typeof afterTimestamp === 'string' && !afterTimestamp.match(/^[1-9][0-9]*$/)) {
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
          if (typeof afterTimestamp === 'string' && !afterTimestamp.match(/^[1-9][0-9]*$/)) {
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
      } else if (typeof afterTimestamp === 'string' && !afterTimestamp.match(/^[1-9][0-9]*$/)) {
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
      let afterIdValue = afterId;
      if (afterId === null) {
        let afterKey = 'afterId';
        const misspelling = UrlHelper.findParamInWrongCase('afterId', node.data.next, node.url);
        let values = {};
        if (misspelling !== null) {
          afterKey = 'afterIdAlternative';
          values = { misspelling };
          afterIdValue = UrlHelper.getParam(misspelling, node.data.next, node.url);
        }
        node.log.addPageError(
          node.url,
          this.createError(
            afterKey,
            {
              value: node.data,
              url: node.url,
            },
            values,
          ),
        );
      }

      // Do we have a last item that matches afterId and afterTimestamp?
      if (node.data.items && node.data.items.length > 0) {
        const lastItem = _.get(node.data, `items[${node.data.items.length - 1}]`);
        if (lastItem) {
          const lastItemModified = lastItem.modified;
          const lastItemId = lastItem.id;
          const lastItemCompare = {
            afterTimestamp,
            lastItemModified,
            afterIdValue,
            lastItemId,
          };
          for (const key in lastItemCompare) {
            if (Object.prototype.hasOwnProperty.call(lastItemCompare, key)) {
              if (
                typeof lastItemCompare[key] === 'string'
                && lastItemCompare[key].match(/^[1-9][0-9]*$/)
              ) {
                lastItemCompare[key] *= 1;
              }
            }
          }
          if (
            lastItemCompare.lastItemId !== lastItemCompare.afterIdValue
            || lastItemCompare.lastItemModified !== lastItemCompare.afterTimestamp
          ) {
            node.log.addPageError(
              node.url,
              this.createError(
                'lastItemMatch',
                {
                  value: node.data,
                  url: node.url,
                },
              ),
            );
          }
        }
      }

      const compare = {
        afterTimestamp,
        lastTimestamp,
        afterId,
        lastId,
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
            {
              url: node.data.next,
            },
          ),
        );
      }
      this.lastTimestamp = compare.afterTimestamp;
      this.lastId = compare.afterId;
    }
  }
}

module.exports = AfterTimestampRule;
