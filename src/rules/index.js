import AfterTimestampRule from './page/after-timestamp-rule.js';
import AfterChangeNumberRule from './page/after-change-number-rule.js';
import MinimumItemsRule from './page/minimum-items-rule.js';
import DeletedItemsRule from './page/deleted-items-rule.js';
import DuplicateItemsRule from './page/duplicate-items-rule.js';
import NextPageValidRule from './page/next-page-valid-rule.js';
import NextPageNotCurrentPageRule from './page/next-page-not-current-page-rule.js';
import NextUrlBasePathMatchCurrentPage from './page/next-page-base-url-match-current-page-rule.js';
import RequiredPropertiesRule from './page/required-properties-rule.js';
import RequiredItemPropertiesRule from './page/required-item-properties-rule.js';
import RequiredPropertyValuesRule from './page/required-property-values-rule.js';
import ItemDataPromptRule from './page/item-data-prompt-rule.js';

import NoLastPageItemsRule from './last-page/no-last-page-items-rule.js';
import LastPageUrlIsSelfRule from './last-page/last-page-url-is-self-rule.js';

import HttpStatusRule from './http/http-status-rule.js';
import HttpContentTypeRule from './http/http-content-type-rule.js';
import HttpCacheHeaderRule from './http/http-cache-header-rule.js';
import ValidJsonObjectRule from './http/valid-json-object-rule.js';

import LastPageCheckRule from './pre-last-page/last-page-check-rule.js';

export default {
  page: [
    AfterTimestampRule,
    AfterChangeNumberRule,
    MinimumItemsRule,
    DeletedItemsRule,
    DuplicateItemsRule,
    NextPageValidRule,
    NextPageNotCurrentPageRule,
    NextUrlBasePathMatchCurrentPage,
    RequiredPropertiesRule,
    RequiredItemPropertiesRule,
    RequiredPropertyValuesRule,
    ItemDataPromptRule,
  ],
  preLastPage: [
    LastPageCheckRule,
  ],
  lastPage: [
    NextPageValidRule,
    NextPageNotCurrentPageRule,
    NextUrlBasePathMatchCurrentPage,
    NoLastPageItemsRule,
    LastPageUrlIsSelfRule,
    RequiredPropertiesRule,
    RequiredItemPropertiesRule,
    RequiredPropertyValuesRule,
  ],
  http: [
    HttpStatusRule,
    HttpContentTypeRule,
    ValidJsonObjectRule,
    HttpCacheHeaderRule,
  ],
};
