const { parse: parseCacheControlHeader } = require('cache-parser');
const {
  ValidationErrorCategory,
  ValidationErrorSeverity,
} = require('@openactive/data-model-validator');
const RpdeRule = require('../../rpde-rule');
const RpdeErrorType = require('../../errors/rpde-error-type');

const HttpCacheHeaderRule = class extends RpdeRule {
  constructor() {
    super();
    this.meta = {
      name: 'HttpCacheHeaderRule',
      description: 'Validates that for open data feeds (and not for Orders feeds) the Cache-Control header returned from the server includes "public", and "max-age" has a value of either 8 (for last page) or 3600 (otherwise)',
      tests: {
        default: {
          description: 'Raises a warning if the Cache-Control header returned from the server for any page of an open data feed before the last page is not "public", and has a "max-age" with a value of at least 3600',
          message: 'Response header `Cache-Control` should include "public", and also include a "max-age" of 3600 or more for all pages except the last page of the feed. Actual header returned was `"{{cacheControl}}"`',
          sampleValues: {
            cacheControl: 'public, max-age=3600',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.MISSING_CACHE_CONTROL,
        },
        lastPage: {
          description: 'Raises a warning if the Cache-Control header returned from the server for the last page of an open data feed is not "public", and has a "max-age" with a value of 8 or less',
          message: 'Response header `Cache-Control` should include "public", and also include a "max-age" of 8 or less for the last page of the feed. Actual header returned was `"{{cacheControl}}"`',
          sampleValues: {
            cacheControl: 'public, max-age=8',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: RpdeErrorType.MISSING_CACHE_CONTROL,
        },
        ordersFeed: {
          description: 'Raises a failure if the Cache-Control header returned from the server for an Orders feed is "public" with any value of "max-age"',
          message: 'Response header `Cache-Control` should not be "public" or include "max-age" for Open Booking API Orders Feeds. Actual header returned was `"{{cacheControl}}"`',
          sampleValues: {
            cacheControl: 'public, max-age=8',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: RpdeErrorType.EXCESSIVE_CACHE_CONTROL,
        },
      },
    };
  }

  validate(node) {
    const { cacheControl } = node.data;
    const { public: isCacheable, maxAge } = parseCacheControlHeader(cacheControl);

    if (!node.isOrdersFeed) {
      if (node.isLastPage && (!isCacheable || maxAge > 8)) {
        node.log.addPageError(
          node.url,
          this.createError(
            'lastPage',
            {
              value: node.data,
              url: node.url,
            },
            {
              cacheControl,
            },
          ),
        );
      } else if (!node.isLastPage && (!isCacheable || maxAge < 3600)) {
        node.log.addPageError(
          node.url,
          this.createError(
            'default',
            {
              value: node.data,
              url: node.url,
            },
            {
              cacheControl,
            },
          ),
        );
      }
    } else if (isCacheable) {
      node.log.addPageError(
        node.url,
        this.createError(
          'ordersFeed',
          {
            value: node.data,
            url: node.url,
          },
          {
            cacheControl,
          },
        ),
      );
    }
  }
};

module.exports = HttpCacheHeaderRule;
