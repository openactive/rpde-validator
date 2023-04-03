const { DateTime } = require('luxon');

export default class LastPageHelper {
  static calculateLastPageTimestamp(timestamp) {
    if (
      typeof timestamp === 'number'
      || (
        typeof timestamp === 'string'
        && timestamp.match(/^[1-9][0-9]*$/)
      )
    ) {
      // Unix time
      const expectedTimeMs = DateTime.local().toMillis();
      const expectedTime = expectedTimeMs / 1000;

      const localTimestamp = timestamp * 1;
      if (localTimestamp <= expectedTime) {
        return Math.floor(
          DateTime.local().plus({ years: 1 }).toMillis() / 1000,
        );
      }
      if (localTimestamp <= expectedTimeMs) {
        return DateTime.local().plus({ years: 1 }).toMillis();
      }
      return Number.MAX_SAFE_INTEGER;
    }
    if (typeof timestamp === 'string') {
      const formats = [
        'yyyy-MM-dd\'T\'HH:mm:ss.SSSZZ',
        'yyyy-MM-dd\'T\'HH:mm:ss.SSSZZZ',
        'yyyy-MM-dd\'T\'HH:mm:ss.SSS',
        'yyyy-MM-dd\'T\'HH:mm:ssZZ',
        'yyyy-MM-dd\'T\'HH:mm:ssZZZ',
        'yyyy-MM-dd\'T\'HH:mm:ss',
        'yyyy-MM-dd HH:mm:ss',
      ];
      for (const format of formats) {
        const dt = DateTime.fromFormat(timestamp, format);
        if (dt.isValid) {
          return DateTime.local().plus({ years: 1 }).toFormat(format);
        }
      }
    }
    return null;
  }

  static calculateLastPageChangeNumber() {
    return Number.MAX_SAFE_INTEGER;
  }
}
