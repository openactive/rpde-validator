const RpdeErrorType = {
  INVALID_JSON: 'invalid_json',
  NO_DELETED_ITEMS: 'no_deleted_items',
  MISSING_REQUIRED_FIELD: 'missing_required_field',
  NO_DATA_IN_DELETED_ITEM: 'no_data_in_deleted_item',
  MISSING_RECOMMENDED_FIELD: 'missing_recommended_field',
  URL_SHOULD_BE_ABSOLUTE: 'url_should_be_absolute',
  INVALID_TYPE: 'invalid_type',
  INVALID_FORMAT: 'invalid_format',
  AFTER_PARAM_SHOULD_INCREASE: 'after_param_should_increase',
  NO_DUPLICATE_ITEMS: 'no_duplicate_items',
  MINIMUM_ITEMS_PER_PAGE: 'minimum_items_per_page',
  NO_LAST_PAGE_CHECK: 'no_last_page_check',
  INVALID_STATUS_CODE: 'invalid_status_code',
  INVALID_CONTENT_TYPE: 'invalid_content_type',
  LAST_PAGE_NO_ITEMS: 'last_page_no_items',
  LAST_PAGE_REFERENCE_SELF: 'last_page_reference_self',
};

export default Object.freeze(RpdeErrorType);
