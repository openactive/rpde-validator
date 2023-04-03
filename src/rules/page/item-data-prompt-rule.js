const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} = require('@openactive/data-model-validator');
const RpdeRule = require('../../rpde-rule');
const RpdeErrorType = require('../../errors/rpde-error-type');

const ItemDataPromptRule = class extends RpdeRule {
  constructor() {
    super();
    this.hasModellingData = false;
    this.meta = {
      name: 'ItemDataPromptRule',
      description: 'Adds some prompts depending on whether the item data conforms to the data modelling spec.',
      tests: {
        noModelling: {
          description: 'Raises a notice if the data supplied does not attempt to comply with the modelling spec.',
          message: 'It appears that this feed does not use the Modelling Opportunity Data specification. Whilst the RPDE specification does not mandate adherence to the Modelling Opportunity Data specification, we recommend that you do to ensure data portability.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: RpdeErrorType.NO_MODELLING_DATA,
        },
        yesModelling: {
          description: 'Raises a notice with a prompt to use the model validator if using the modelling spec.',
          message: 'It appears that this feed is attempting to comply with the Modelling Opportunity Data specification. To validate the "data" objects within this feed please use the [Model tab](https://validator.openactive.io) of this validator.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: RpdeErrorType.HAS_MODELLING_DATA,
        },
      },
    };
  }

  validate(node) {
    if (
      typeof node.data !== 'object'
      || typeof node.data.items !== 'object'
      || !(node.data.items instanceof Array)
      || this.hasModellingData
    ) {
      return;
    }

    const openActiveContext = /openactive\.io/;

    for (const item of node.data.items) {
      if (
        typeof item.data === 'object'
        && !(item.data instanceof Array)
      ) {
        let isMatch = false;
        if (typeof item.data['@context'] === 'string') {
          isMatch = item.data['@context'].match(openActiveContext);
        }
        if (
          typeof item.data['@context'] === 'object'
          && item.data['@context'] instanceof Array
        ) {
          for (const context of item.data['@context']) {
            isMatch = context.match(openActiveContext);
            if (isMatch) {
              break;
            }
          }
        }
        if (isMatch) {
          this.hasModellingData = true;
          break;
        }
      }
    }
  }

  after(node) {
    let key = 'noModelling';
    if (this.hasModellingData) {
      key = 'yesModelling';
    }
    node.log.addPageError(
      node.url,
      this.createError(
        key,
        {
          value: node.data,
          url: node.url,
        },
      ),
    );
  }
};

module.exports = ItemDataPromptRule;
