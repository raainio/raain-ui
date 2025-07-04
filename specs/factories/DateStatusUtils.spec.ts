import {expect} from 'chai';
import {DateRange} from '../../src';
import {DateStatusUtils} from '../../src/factories/DateStatusUtils';
import sinon from 'sinon';

describe('Factories.DateStatusUtils', () => {
    // Sample data for testing
    const dateStatusPoints1 = [
        {date: new Date('2022-05-01T13:05:00Z'), value: 2},
        {date: new Date('2023-05-01T13:05:00Z'), value: 2},
        {date: new Date('2023-06-01T13:05:00Z'), value: 2},
        {date: new Date('2023-06-02T00:00:00Z'), value: 1},
        {date: new Date('2023-06-02T13:12:00Z'), value: 3},
        {date: new Date('2023-06-02T14:39:00Z'), value: 5},
    ];
    const dateStatusPoints2 = [
        {date: new Date('2023-05-12T11:05:00Z'), value: 5},
        {date: new Date('2023-04-02T13:15:00Z'), value: 8},
        {date: new Date('2023-06-02T13:15:00Z'), value: 7},
        {date: new Date('2023-06-02T13:19:00Z'), value: 6},
        {date: new Date('2023-06-02T13:29:00Z'), value: 5},
        {date: new Date('2023-06-02T14:29:00Z'), value: 5},
        {date: new Date('2023-06-12T13:22:00Z'), value: 3},
        {date: new Date('2024-06-12T13:22:00Z'), value: 3},
    ];
    const setOfDates = [
        {label: 'data 1', style: 'bar', values: dateStatusPoints1},
        {label: 'data 2', style: 'bar', values: dateStatusPoints2},
    ];

    let timezoneStub;

    beforeEach(() => {
        // Stub the timezone offset to always return -120 minutes (UTC+2)
        timezoneStub = sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-120);
    });

    afterEach(() => {
        // Restore the original method after each test
        timezoneStub.restore();
    });

    describe('filterFocus', () => {
        it('should filter data points based on focus date and range', () => {
            const focusDate = new Date('2023-06-02T13:00:00Z');

            // Test YEAR range
            let filtered = DateStatusUtils.filterFocus(
                dateStatusPoints1,
                focusDate,
                DateRange.YEAR
            );
            expect(filtered.length).to.equal(5);
            filtered.forEach((point) => {
                expect(point.date.getUTCFullYear()).to.equal(focusDate.getUTCFullYear());
            });

            // Test MONTH range
            filtered = DateStatusUtils.filterFocus(dateStatusPoints1, focusDate, DateRange.MONTH);
            expect(filtered.length).to.equal(4);
            filtered.forEach((point) => {
                expect(point.date.getUTCFullYear()).to.equal(focusDate.getUTCFullYear());
                expect(point.date.getUTCMonth()).to.equal(focusDate.getUTCMonth());
            });

            // Test DAY range
            filtered = DateStatusUtils.filterFocus(dateStatusPoints1, focusDate, DateRange.DAY);
            expect(filtered.length).to.equal(3);
            filtered.forEach((point) => {
                expect(point.date.getUTCFullYear()).to.equal(focusDate.getUTCFullYear());
                expect(point.date.getUTCMonth()).to.equal(focusDate.getUTCMonth());
                expect(point.date.getUTCDate()).to.equal(focusDate.getUTCDate());
            });

            // Test HOUR range
            filtered = DateStatusUtils.filterFocus(dateStatusPoints1, focusDate, DateRange.HOUR);
            expect(filtered.length).to.equal(1);
            filtered.forEach((point) => {
                expect(point.date.getUTCFullYear()).to.equal(focusDate.getUTCFullYear());
                expect(point.date.getUTCMonth()).to.equal(focusDate.getUTCMonth());
                expect(point.date.getUTCDate()).to.equal(focusDate.getUTCDate());
                expect(point.date.getUTCHours()).to.equal(focusDate.getUTCHours());
            });

            // Test with empty array
            filtered = DateStatusUtils.filterFocus([], focusDate, DateRange.YEAR);
            expect(filtered.length).to.equal(0);
        });

        it('should sort filtered data points by date', () => {
            const focusDate = new Date('2023-06-02T00:00:00Z');
            const filtered = DateStatusUtils.filterFocus(
                dateStatusPoints1,
                focusDate,
                DateRange.DAY
            );

            for (let i = 1; i < filtered.length; i++) {
                expect(filtered[i].date.getTime()).to.be.at.least(filtered[i - 1].date.getTime());
            }
        });
    });

    describe('groupFocus', () => {
        it('should group data points by CENTURY', () => {
            const focusDate = new Date('2023-01-01T00:00:00Z');
            const min = new Date('2022-01-01T00:00:00Z');
            const max = new Date('2024-01-01T00:00:00Z');

            const grouped = DateStatusUtils.groupFocus(
                [...dateStatusPoints1, ...dateStatusPoints2],
                focusDate,
                DateRange.CENTURY,
                min,
                max
            );

            expect(grouped.length).to.equal(3); // 2022, 2023, 2024
            expect(JSON.stringify(grouped)).to.equal('[2,52,3]');
        });

        it('should group data points by YEAR', () => {
            const focusDate = new Date('2023-01-01T00:00:00Z');
            const min = new Date('2023-01-01T00:00:00Z');
            const max = new Date('2023-12-31T00:00:00Z');

            const grouped = DateStatusUtils.groupFocus(
                [...dateStatusPoints1, ...dateStatusPoints2],
                focusDate,
                DateRange.YEAR,
                min,
                max
            );

            expect(grouped.length).to.equal(12); // 12 months
            expect(JSON.stringify(grouped)).to.equal('[0,0,0,8,7,37,0,0,0,0,0,0]');
        });

        it('should group data points by MONTH', () => {
            const focusDate = new Date('2023-06-01T00:00:00Z');
            const min = new Date('2023-06-01T00:00:00Z');
            const max = new Date('2023-07-01T00:00:00Z');

            const grouped = DateStatusUtils.groupFocus(
                [...dateStatusPoints1, ...dateStatusPoints2],
                focusDate,
                DateRange.MONTH,
                min,
                max
            );

            // Should have entries for each day in June
            expect(grouped.length).to.equal(30);
            expect(JSON.stringify(grouped)).to.equal(
                '[2,32,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]'
            );
        });

        it('should group data points by DAY', () => {
            const focusDate = new Date('2023-06-02T00:00:00Z');
            const min = new Date('2023-06-02T00:00:00Z');
            const max = new Date('2023-06-03T00:00:00Z');

            const grouped = DateStatusUtils.groupFocus(
                [...dateStatusPoints1, ...dateStatusPoints2],
                focusDate,
                DateRange.DAY,
                min,
                max
            );

            expect(grouped.length).to.equal(24); // 24 hours
            expect(JSON.stringify(grouped)).to.equal(
                '[1,0,0,0,0,0,0,0,0,0,0,0,0,21,10,0,0,0,0,0,0,0,0,0]'
            );
        });

        it('should group data points by HOUR', () => {
            const focusDate = new Date('2023-06-02T13:00:00Z');
            const min = new Date('2023-06-02T13:00:00Z');
            const max = new Date('2023-06-02T14:00:00Z');

            const grouped = DateStatusUtils.groupFocus(
                [...dateStatusPoints1, ...dateStatusPoints2],
                focusDate,
                DateRange.HOUR,
                min,
                max
            );

            expect(grouped.length).to.equal(60); // 60 minutes
            expect(JSON.stringify(grouped)).to.equal(
                '[0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,7,0,0,0,6,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]'
            );
        });
    });

    describe('focusLabels', () => {
        it('should generate labels for CENTURY range', () => {
            const focusDate = new Date('2023-01-01T00:00:00Z');
            const min = new Date('2022-01-01T00:00:00Z');
            const max = new Date('2024-01-01T00:00:00Z');

            const labels = DateStatusUtils.focusLabels(
                focusDate,
                DateRange.CENTURY,
                min,
                max,
                setOfDates
            );

            expect(labels.length).to.equal(3); // 2022, 2023, 2024
            expect(labels[0]).to.equal('2022');
            expect(labels[1]).to.equal('2023');
            expect(labels[2]).to.equal('2024');
        });

        it('should generate labels for YEAR range', () => {
            const focusDate = new Date('2023-01-01T00:00:00Z');
            const min = new Date('2023-01-01T00:00:00Z');
            const max = new Date('2023-12-31T00:00:00Z');

            const labels = DateStatusUtils.focusLabels(
                focusDate,
                DateRange.YEAR,
                min,
                max,
                setOfDates
            );

            expect(labels.length).to.equal(12); // 12 months
            expect(labels[0]).to.equal('2023-01');
            expect(labels[5]).to.equal('2023-06');
            expect(labels[11]).to.equal('2023-12');
        });

        it('should generate labels for MONTH range', () => {
            const focusDate = new Date('2023-06-01T00:00:00Z');
            const min = new Date('2023-06-01T00:00:00Z');
            const max = new Date('2023-06-30T00:00:00Z');

            const labels = DateStatusUtils.focusLabels(
                focusDate,
                DateRange.MONTH,
                min,
                max,
                setOfDates
            );

            expect(labels.length).to.equal(30); // Days in June
            expect(labels[0]).to.equal('2023-06-01');
            expect(labels[29]).to.equal('2023-06-30');
        });

        it('should generate labels for DAY range', () => {
            const focusDate = new Date('2023-06-02T00:00:00Z');
            const min = new Date('2023-06-02T00:00:00Z');
            const max = new Date('2023-06-02T00:00:00Z');

            const labels = DateStatusUtils.focusLabels(
                focusDate,
                DateRange.DAY,
                min,
                max,
                setOfDates
            );

            expect(labels.length).to.equal(24); // 24 hours
            expect(labels[0]).to.equal('2023-06-02 02h');
            expect(labels[13]).to.equal('2023-06-02 15h');
            expect(labels[23]).to.equal('2023-06-03 01h');
        });

        it('should generate labels for HOUR range', () => {
            const focusDate = new Date('2023-06-02T13:00:00Z');
            const min = new Date('2023-06-02T13:00:00Z');
            const max = new Date('2023-06-02T13:59:00Z');

            const labels = DateStatusUtils.focusLabels(
                focusDate,
                DateRange.HOUR,
                min,
                max,
                setOfDates
            );

            expect(labels.length).to.equal(60); // 60 minutes
            // Check format rather than exact time due to timezone differences
            expect(labels[0]).to.match(/^2023-06-02 \d{2}:00$/);
            expect(labels[59]).to.match(/^2023-06-02 \d{2}:59$/);
        });
    });

    describe('getFocusDateAndTitle', () => {
        it('should get focus date and title for YEAR range', () => {
            const focusDate = new Date('2023-01-01T00:00:00Z');
            const min = new Date('2022-01-01T00:00:00Z');
            const max = new Date('2024-01-01T00:00:00Z');

            const result = DateStatusUtils.getFocusDateAndTitle(
                focusDate,
                DateRange.YEAR,
                1, // Index for 2023
                min,
                max
            );

            expect(result.newTitle).to.equal('2023');
            expect(result.newFocusDate.getUTCFullYear()).to.equal(2023);
        });

        it('should get focus date and title for MONTH range', () => {
            const focusDate = new Date('2023-01-01T00:00:00Z');

            const result = DateStatusUtils.getFocusDateAndTitle(
                focusDate,
                DateRange.MONTH,
                5, // Index for June
                new Date('2023-01-01T00:00:00Z'),
                new Date('2023-12-31T00:00:00Z')
            );

            expect(result.newTitle).to.equal('2023-06');
            expect(result.newFocusDate.getUTCMonth()).to.equal(5); // June is 5 (0-based)
        });

        it('should get focus date and title for DAY range', () => {
            const focusDate = new Date('2023-06-01T00:00:00Z');

            const result = DateStatusUtils.getFocusDateAndTitle(
                focusDate,
                DateRange.DAY,
                15, // begin with 0 => 16th of June
                new Date('2023-06-01T00:00:00Z'),
                new Date('2023-06-30T00:00:00Z')
            );

            expect(result.newTitle).to.equal('2023-06-16');
            expect(result.newFocusDate.getUTCDate()).to.equal(16);
        });

        it('should get focus date and title for HOUR range', () => {
            const focusDate = new Date('2023-06-01T00:00:00Z');

            const result = DateStatusUtils.getFocusDateAndTitle(
                focusDate,
                DateRange.HOUR,
                13, // 13th hour
                new Date('2023-06-01T00:00:00Z'),
                new Date('2023-06-01T23:59:00Z')
            );

            // Check format rather than exact date/time due to timezone differences
            expect(result.newTitle).to.match(/^\d{4}-\d{2}-\d{2} 15h$/);
            expect(result.newFocusDate.getUTCHours()).to.equal(13);
        });
    });

    describe('getDaysInMonth', () => {
        it('should return the correct number of days for each month', () => {
            // Test January (31 days)
            let date = new Date('2023-01-15T00:00:00Z');
            expect(DateStatusUtils.getDaysInMonth(date)).to.equal(31);

            // Test February in a non-leap year (28 days)
            date = new Date('2023-02-15T00:00:00Z');
            expect(DateStatusUtils.getDaysInMonth(date)).to.equal(28);

            // Test February in a leap year (29 days)
            date = new Date('2024-02-15T00:00:00Z');
            expect(DateStatusUtils.getDaysInMonth(date)).to.equal(29);

            // Test April (30 days)
            date = new Date('2023-04-15T00:00:00Z');
            expect(DateStatusUtils.getDaysInMonth(date)).to.equal(30);
        });
    });

    describe('buildLabel methods', () => {
        it('should build label for a date', () => {
            const date = new Date('2023-06-02T13:15:00Z');
            const label = DateStatusUtils.buildLabel(date);
            expect(label).to.equal('2023-06-02 13:15');
        });

        it('should build label for a year', () => {
            const date = new Date('2023-06-02T13:15:00Z');
            const label = DateStatusUtils.buildLabelYear(date, 2024);
            expect(label).to.equal('2024');
            expect(date.getUTCFullYear()).to.equal(2024);
            expect(date.getUTCMonth()).to.equal(0);
            expect(date.getUTCDate()).to.equal(1);
            expect(date.getUTCHours()).to.equal(0);
            expect(date.getUTCMinutes()).to.equal(0);
            expect(date.getUTCSeconds()).to.equal(0);
        });

        it('should build label for a month', () => {
            const date = new Date('2023-06-02T13:15:00Z');
            const label = DateStatusUtils.buildLabelMonth(date, 5); // June (0-based)
            expect(label).to.equal('2023-06');
            expect(date.getUTCMonth()).to.equal(5);
            expect(date.getUTCDate()).to.equal(1);
            expect(date.getUTCHours()).to.equal(0);
            expect(date.getUTCMinutes()).to.equal(0);
            expect(date.getUTCSeconds()).to.equal(0);
        });

        it('should build label for a day', () => {
            const date = new Date('2023-06-02T13:15:00Z');
            const label = DateStatusUtils.buildLabelDay(date, 15);
            expect(label).to.equal('2023-06-15');
            expect(date.getUTCDate()).to.equal(15);
            expect(date.getUTCHours()).to.equal(0);
            expect(date.getUTCMinutes()).to.equal(0);
            expect(date.getUTCSeconds()).to.equal(0);
        });

        it('should build label for an hour', () => {
            const date = new Date('2023-06-02T13:15:00Z');
            const label = DateStatusUtils.buildLabelHour(date, 10);
            expect(label).to.equal('UTC 2023-06-02 10h');
            expect(date.getUTCHours()).to.equal(10);
            expect(date.getUTCMinutes()).to.equal(0);
            expect(date.getUTCSeconds()).to.equal(0);
        });

        it('should build label for a minute', () => {
            const date = new Date('2023-06-02T13:15:00Z');
            const label = DateStatusUtils.buildLabelMinute(date, 30);
            expect(label).to.equal('UTC 2023-06-02 13:30');
            expect(date.getUTCMinutes()).to.equal(30);
            expect(date.getUTCSeconds()).to.equal(0);
        });
    });
});
