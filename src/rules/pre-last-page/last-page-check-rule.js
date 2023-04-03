import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

class LastPageCheckRule extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'LastPageCheckRule',
      description: 'Raises a failure if the last page check cannot be carried out',
      tests: {
        default: {
          description: 'Raises a failure if the last page check cannot be carried out due to not knowing the ordering type',
          message: 'The last page check could not be carried out, as no sample values for `afterTimestamp` or `afterChangeNumber` could be found',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.NO_LAST_PAGE_CHECK,
        },
        lastTimestamp: {
          description: 'Raises a failure if the last page check cannot be carried out due to "afterTimestamp" not being an integer',
          message: 'The last page check could not be reliably completed, as `modified` and `afterTimestamp` values should be integers. It is recommended that these are integers to be compatible with future versions of RPDE.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.NO_LAST_PAGE_CHECK,
        },
        lastChangeNumber: {
          description: 'Raises a failure if the last page check cannot be carried out due to "afterChangeNumber" not being an integer',
          message: 'The last page check could not be completed, as `afterChangeNumber` values should be integers.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.NO_LAST_PAGE_CHECK,
        },
      },
    };
  }

  validate(node) {
    if (node.data.lastTimestamp !== null) {
      if (
        typeof node.data.lastTimestamp !== 'number'
        && !node.data.lastTimestamp.match(/^[1-9][0-9]*$/)
      ) {
        node.log.addPageError(
          node.url,
          this.createError(
            'lastTimestamp',
            {
              url: node.url,
            },
          ),
        );
      }
    } else if (node.data.lastChangeNumber !== null) {
      if (
        typeof node.data.lastChangeNumber !== 'number'
        && !node.data.lastChangeNumber.match(/^[1-9][0-9]*$/)
      ) {
        node.log.addPageError(
          node.url,
          this.createError(
            'lastChangeNumber',
            {
              url: node.url,
            },
          ),
        );
      }
    } else {
      node.log.addPageError(
        node.url,
        this.createError(
          'default',
          {
            url: node.url,
          },
        ),
      );
    }
  }
}

export default LastPageCheckRule;
