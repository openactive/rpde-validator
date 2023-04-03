const RpdeErrorType = {
  INVALID_JSON: 'invalid_json',
  NO_DELETED_ITEMS: 'no_deleted_items',
  MISSING_REQUIRED_FIELD: 'missing_required_field',
  FIELD_NOT_ALLOWED: 'field_not_allowed',
  MISSING_DATA_IN_UPDATED_ITEM: 'missing_data_in_updated_item',
  UNNECESSARY_DATA_IN_DELETED_ITEM: 'unnecessary_data_in_deleted_item',
  MISSING_RECOMMENDED_FIELD: 'missing_recommended_field',
  URL_SHOULD_BE_ABSOLUTE: 'url_should_be_absolute',
  INVALID_TYPE: 'invalid_type',
  INVALID_NEXT_URL_FOR_ZERO_ITEMS: 'invalid_next_url_for_zero_items',
  BASE_URL_MISMATCH: 'base_url_mismatch',
  INVALID_FORMAT: 'invalid_format',
  AFTER_PARAM_SHOULD_INCREASE: 'after_param_should_increase',
  NO_DUPLICATE_ITEMS: 'no_duplicate_items',
  MINIMUM_ITEMS_PER_PAGE: 'minimum_items_per_page',
  NO_LAST_PAGE_CHECK: 'no_last_page_check',
  INVALID_STATUS_CODE: 'invalid_status_code',
  INVALID_CONTENT_TYPE: 'invalid_content_type',
  LAST_PAGE_NO_ITEMS: 'last_page_no_items',
  LAST_PAGE_REFERENCE_SELF: 'last_page_reference_self',
  AFTER_ID_WITH_TIMESTAMP: 'after_id_with_timestamp',
  LAST_ITEM_NOT_MATCHING_NEXT: 'last_item_not_matching_next',
  NO_MODELLING_DATA: 'no_modelling_data',
  HAS_MODELLING_DATA: 'has_modelling_data',
  HTTP_ERROR: 'http_error',
  MISSING_CACHE_CONTROL: 'missing_cache_control',
  EXCESSIVE_CACHE_CONTROL: 'excessive_cache_control',
};

module.exports = Object.freeze(RpdeErrorType);
