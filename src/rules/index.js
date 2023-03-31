import AfterTimestampRule from './page/after-timestamp-rule';
import AfterChangeNumberRule from './page/after-change-number-rule';
import MinimumItemsRule from './page/minimum-items-rule';
import DeletedItemsRule from './page/deleted-items-rule';
import DuplicateItemsRule from './page/duplicate-items-rule';
import NextPageValidRule from './page/next-page-valid-rule';
import NextPageNotCurrentPageRule from './page/next-page-not-current-page-rule';
import NextUrlBasePathMatchCurrentPage from './page/next-page-base-url-match-current-page-rule';
import RequiredPropertiesRule from './page/required-properties-rule';
import RequiredItemPropertiesRule from './page/required-item-properties-rule';
import RequiredPropertyValuesRule from './page/required-property-values-rule';
import ItemDataPromptRule from './page/item-data-prompt-rule';

import NoLastPageItemsRule from './last-page/no-last-page-items-rule';
import LastPageUrlIsSelfRule from './last-page/last-page-url-is-self-rule';

import HttpStatusRule from './http/http-status-rule';
import HttpContentTypeRule from './http/http-content-type-rule';
import HttpCacheHeaderRule from './http/http-cache-header-rule';
import ValidJsonObjectRule from './http/valid-json-object-rule';

import LastPageCheckRule from './pre-last-page/last-page-check-rule';

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
