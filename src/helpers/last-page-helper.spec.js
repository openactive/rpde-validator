const { DateTime } = require('luxon');
const LastPageHelper = require('./last-page-helper');

describe('LastPageHelper', () => {
  describe('calculateLastPageTimestamp', () => {
    it('should detect a unix timestamp in seconds', () => {
      const dt = DateTime.fromISO('2017-08-25T00:00:00');
      const unixTime = dt.toMillis() / 1000;

      const expectedTime = Math.floor(DateTime.local().plus({ years: 1 }).toMillis() / 1000);

      expect(
        LastPageHelper.calculateLastPageTimestamp(unixTime),
      ).toBeGreaterThanOrEqual(
        expectedTime,
      );
    });
    it('should detect a unix timestamp in milliseconds', () => {
      const dt = DateTime.fromISO('2017-08-25T00:00:00');
      const unixTime = dt.toMillis();

      const expectedTime = DateTime.local().plus({ years: 1 }).toMillis();

      expect(
        LastPageHelper.calculateLastPageTimestamp(unixTime),
      ).toBeGreaterThanOrEqual(
        expectedTime,
      );
    });
    it('should detect an iso string', () => {
      const isoString = '2017-08-25T00:00:00';

      const expectedTime = DateTime.local().plus({ years: 1 }).set({ millisecond: 0 }).toMillis();

      expect(
        DateTime.fromISO(
          LastPageHelper.calculateLastPageTimestamp(isoString),
        ).toMillis(),
      ).toBeGreaterThanOrEqual(
        expectedTime,
      );
    });
    it('should detect an iso string with milliseconds', () => {
      const isoString = '2017-08-25T00:00:00.234';

      const expectedTime = DateTime.local().plus({ years: 1 }).toMillis();

      expect(
        DateTime.fromISO(
          LastPageHelper.calculateLastPageTimestamp(isoString),
        ).toMillis(),
      ).toBeGreaterThanOrEqual(
        expectedTime,
      );
    });
    it('should return null for an invalid string', () => {
      const isoString = 'asdasd';

      expect(
        LastPageHelper.calculateLastPageTimestamp(isoString),
      ).toBeNull();
    });
  });
  describe('calculateLastPageChangeNumber', () => {
    it('should return the maximum safe integer', () => {
      expect(LastPageHelper.calculateLastPageChangeNumber()).toBe(Number.MAX_SAFE_INTEGER);
    });
  });
});
