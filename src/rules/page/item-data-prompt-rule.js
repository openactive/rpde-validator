import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import RpdeRule from '../../rpde-rule';
import RpdeErrorType from '../../errors/rpde-error-type';

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
          description: 'Raises a failure if the data field is present on a deleted item',
          message: 'It appears that this feed is attempting to comply with the Modelling Opportunity Data specification. If you\'d like to validate that item data conforms to the spec, try the OpenActive Data Validator at https://validator.openactive.io/.',
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

    const openActiveContext = 'https://www.openactive.io/ns/oa.jsonld';

    for (const item of node.data.items) {
      if (
        typeof item.data === 'object'
        && !(item.data instanceof Array)
      ) {
        if (
          (
            typeof item.data['@context'] === 'string'
            && item.data['@context'] === openActiveContext
          )
          || (
            typeof item.data['@context'] === 'object'
            && item.data['@context'] instanceof Array
            && item.data['@context'].indexOf(openActiveContext) >= 0
          )
        ) {
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

export default ItemDataPromptRule;
