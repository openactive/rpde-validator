import ValidJsonObjectRule from './page/valid-json-object-rule';
import AfterTimestampRule from './page/after-timestamp-rule';
import AfterChangeNumberRule from './page/after-change-number-rule';
import MinimumItemsRule from './page/minimum-items-rule';
import DeletedItemsRule from './page/deleted-items-rule';
import DuplicateItemsRule from './page/duplicate-items-rule';
import NextPageValidRule from './page/next-page-valid-rule';

import NoLastPageItemsRule from './last-page/no-last-page-items-rule';
import LastPageUrlIsSelfRule from './last-page/last-page-url-is-self-rule';

import HttpStatusRule from './http/http-status-rule';
import HttpContentTypeRule from './http/http-content-type-rule';

import LastPageCheckRule from './pre-last-page/last-page-check-rule';

export default {
  page: [
    ValidJsonObjectRule,
    AfterTimestampRule,
    AfterChangeNumberRule,
    MinimumItemsRule,
    DeletedItemsRule,
    DuplicateItemsRule,
    NextPageValidRule,
  ],
  preLastPage: [
    LastPageCheckRule,
  ],
  lastPage: [
    ValidJsonObjectRule,
    NextPageValidRule,
    NoLastPageItemsRule,
    LastPageUrlIsSelfRule,
  ],
  http: [
    HttpStatusRule,
    HttpContentTypeRule,
  ],
};
