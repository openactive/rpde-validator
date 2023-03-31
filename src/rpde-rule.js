import {
  ValidationError,
} from '@openactive/data-model-validator';

class RpdeRule {
  constructor() {
    this.meta = {
      name: 'RpdeRule',
      description: 'This is a base rule description that should be overridden.',
      tests: {},
    };
  }

  validate() {
    throw Error('RPDE JSON validation rule not implemented');
  }

  after() {
    // noop
  }

  createError(testKey, extra = {}, messageValues = undefined) {
    const rule = this.meta.tests[testKey];
    let { message } = rule;
    if (typeof messageValues !== 'undefined') {
      for (const key in messageValues) {
        if (Object.prototype.hasOwnProperty.call(messageValues, key)) {
          message = message.replace(new RegExp(`{{${key}}}`, 'g'), messageValues[key]);
        }
      }
    }
    const error = {

      ...extra,
      rule: this.meta.name,
      category: rule.category,
      type: rule.type,
      severity: rule.severity,
      message,
      value: null,
    };
    return new ValidationError(error);
  }
}

export default RpdeRule;
