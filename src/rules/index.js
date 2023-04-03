const AfterTimestampRule = require('./page/after-timestamp-rule');
const AfterChangeNumberRule = require('./page/after-change-number-rule');
const MinimumItemsRule = require('./page/minimum-items-rule');
const DeletedItemsRule = require('./page/deleted-items-rule');
const DuplicateItemsRule = require('./page/duplicate-items-rule');
const NextPageValidRule = require('./page/next-page-valid-rule');
const NextPageNotCurrentPageRule = require('./page/next-page-not-current-page-rule');
const NextUrlBasePathMatchCurrentPage = require('./page/next-page-base-url-match-current-page-rule');
const RequiredPropertiesRule = require('./page/required-properties-rule');
const RequiredItemPropertiesRule = require('./page/required-item-properties-rule');
const RequiredPropertyValuesRule = require('./page/required-property-values-rule');
const ItemDataPromptRule = require('./page/item-data-prompt-rule');

const NoLastPageItemsRule = require('./last-page/no-last-page-items-rule');
const LastPageUrlIsSelfRule = require('./last-page/last-page-url-is-self-rule');

const HttpStatusRule = require('./http/http-status-rule');
const HttpContentTypeRule = require('./http/http-content-type-rule');
const HttpCacheHeaderRule = require('./http/http-cache-header-rule');
const ValidJsonObjectRule = require('./http/valid-json-object-rule');

const LastPageCheckRule = require('./pre-last-page/last-page-check-rule');

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
