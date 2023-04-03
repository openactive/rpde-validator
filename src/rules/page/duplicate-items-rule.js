import {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} from '@openactive/data-model-validator';
import jp from 'jsonpath';
import RpdeRule from '../../rpde-rule.js';
import RpdeErrorType from '../../errors/rpde-error-type.js';

const DuplicateItemsRule = class extends RpdeRule {
  constructor() {
    super();
    this.itemMap = [];
    this.itemLocations = {};
    this.meta = {
      name: 'DuplicateItemsRule',
      description: 'Validates that the feed contains no duplicate items',
      tests: {
        default: {
          description: 'Raises a failure if a duplicate item is found at any point in the feed, and caching has not been implemented',
          message: 'Items must not appear more than once in the feed unless that item is updated while validation is in progress. If this error appears consistently, check the sort order is correct in the primary query. If feed pages are being cached, ensure a `Cache-Control` header is provided. Found duplicate id `"{{id}}"` in {{url}}.',
          sampleValues: {
            id: 'ABC123',
            url: 'http://example.org/feed',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.NO_DUPLICATE_ITEMS,
        },
      },
    };
  }

  validate(node) {
    if (typeof node.data !== 'object' || node.isInitialHarvestComplete || node.cacheControlComponents?.isCachedPage) {
      return;
    }
    const ids = jp.query(node.data, '$.items[*].id');
    for (const id of ids) {
      if (this.itemMap.indexOf(id) >= 0) {
        node.log.addPageError(
          node.url,
          this.createError(
            'default',
            {
              value: node.data,
              url: node.url,
            },
            {
              id,
              url: this.itemLocations[id],
            },
          ),
        );
      } else {
        this.itemMap.push(id);
        this.itemLocations[id] = node.url;
      }
    }
  }
};

export default DuplicateItemsRule;
