import {DateRange, Tools} from './Tools';

export class DateStatusUtils {
    /**
     * Gets the number of days in a month for a given date
     */
    public static getDaysInMonth(date: Date): number {
        // Create a new date for the first day of the next month, then get the day before (0th day)
        // This gives us the last day of the current month, which is the number of days in the month
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getDate();
    }

    /**
     * Filters data points based on the focus date and range
     */
    public static filterFocus(
        mapToFilter: Array<{date: Date; value: number}>,
        focusDate: Date,
        focusRange: DateRange
    ): Array<{
        date: Date;
        value: number;
    }> {
        return mapToFilter
            .filter((e) => {
                let isIn = true;
                if (isIn && focusRange >= DateRange.YEAR) {
                    isIn = e.date.getUTCFullYear() === focusDate.getUTCFullYear();
                }
                if (isIn && focusRange >= DateRange.MONTH) {
                    isIn = e.date.getUTCMonth() === focusDate.getUTCMonth();
                }
                if (isIn && focusRange >= DateRange.DAY) {
                    isIn = e.date.getUTCDate() === focusDate.getUTCDate();
                }
                if (isIn && focusRange >= DateRange.HOUR) {
                    isIn = e.date.getUTCHours() === focusDate.getUTCHours();
                }
                if (isIn && focusRange >= DateRange.MINUTE) {
                    isIn = e.date.getUTCMinutes() === focusDate.getUTCMinutes();
                }
                return isIn;
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    /**
     * Groups data points based on the focus date and range
     */
    public static groupFocus(
        mapToFilter: Array<{date: Date; value: number}>,
        focusDate: Date,
        focusRange: DateRange,
        min: Date,
        max: Date
    ): number[] {
        const filteredAndSorted = DateStatusUtils.filterFocus(mapToFilter, focusDate, focusRange);

        if (focusRange === DateRange.CENTURY) {
            const groupedByYear = [];
            for (let i = min.getUTCFullYear(); i <= max.getUTCFullYear(); i++) {
                const yearDate = new Date(focusDate);
                yearDate.setUTCFullYear(i);
                const sum = DateStatusUtils.filterFocus(
                    filteredAndSorted,
                    yearDate,
                    DateRange.YEAR
                ).reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByYear.push(sum);
            }
            return groupedByYear;
        }

        if (focusRange === DateRange.YEAR) {
            const groupedByMonth = [];
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(focusDate);
                monthDate.setUTCMonth(i);
                const sum = DateStatusUtils.filterFocus(
                    filteredAndSorted,
                    monthDate,
                    DateRange.MONTH
                ).reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByMonth.push(sum);
            }
            return groupedByMonth;
        }

        if (focusRange === DateRange.MONTH) {
            const groupedByDay = [];
            const daysInMonth = DateStatusUtils.getDaysInMonth(focusDate);
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDate = new Date(focusDate);
                dayDate.setUTCDate(i);
                const sum = DateStatusUtils.filterFocus(
                    filteredAndSorted,
                    dayDate,
                    DateRange.DAY
                ).reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByDay.push(sum);
            }
            return groupedByDay;
        }

        if (focusRange === DateRange.DAY) {
            const groupedByHour = [];
            for (let i = 0; i < 24; i++) {
                const hourDate = new Date(focusDate);
                hourDate.setUTCHours(i);
                const sum = DateStatusUtils.filterFocus(
                    filteredAndSorted,
                    hourDate,
                    DateRange.HOUR
                ).reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByHour.push(sum);
            }
            return groupedByHour;
        }

        if (focusRange === DateRange.HOUR) {
            const groupedByMinutes = [];
            for (let i = 0; i < 60; i++) {
                const minuteDate = new Date(focusDate);
                minuteDate.setUTCMinutes(i);
                const sum = DateStatusUtils.filterFocus(
                    filteredAndSorted,
                    minuteDate,
                    DateRange.MINUTE
                ).reduce((partialSum, a) => partialSum + a.value, 0);
                groupedByMinutes.push(sum);
            }
            return groupedByMinutes;
        }

        return filteredAndSorted.map((e) => e.value);
    }

    /**
     * Generates labels for the chart based on the focus date and range
     */
    public static focusLabels(
        focusDate: Date,
        focusRange: DateRange,
        min: Date,
        max: Date,
        data: {
            label: string;
            style: string;
            values: {date: Date; value: number}[];
        }[]
    ): string[] {
        if (focusRange === DateRange.CENTURY) {
            const groupedByYear = [];
            for (let i = min.getUTCFullYear(); i <= max.getUTCFullYear(); i++) {
                groupedByYear.push(DateStatusUtils.buildLabelYear(new Date(focusDate), i));
            }
            return groupedByYear;
        } else if (focusRange === DateRange.YEAR) {
            const groupedByMonth = [];
            for (let i = 0; i < 12; i++) {
                groupedByMonth.push(DateStatusUtils.buildLabelMonth(new Date(focusDate), i));
            }
            return groupedByMonth;
        } else if (focusRange === DateRange.MONTH) {
            const groupedByDay = [];
            const daysInMonth = DateStatusUtils.getDaysInMonth(focusDate);
            for (let i = 1; i <= daysInMonth; i++) {
                groupedByDay.push(DateStatusUtils.buildLabelDay(new Date(focusDate), i));
            }
            return groupedByDay;
        } else if (focusRange === DateRange.DAY) {
            const groupedByHour = [];
            for (let i = 0; i < 24; i++) {
                groupedByHour.push(DateStatusUtils.buildLabelHour(new Date(focusDate), i, true));
            }
            return groupedByHour;
        } else if (focusRange === DateRange.HOUR) {
            const groupedByMinutes = [];
            for (let i = 0; i < 60; i++) {
                groupedByMinutes.push(
                    DateStatusUtils.buildLabelMinute(new Date(focusDate), i, true)
                );
            }
            return groupedByMinutes;
        }

        // all elements that are in the current minute
        let allDates = [];
        data.forEach((d) => {
            allDates = allDates.concat(d.values);
        });
        const filteredDates = DateStatusUtils.filterFocus(allDates, focusDate, DateRange.MINUTE);
        const filteredDatesISO = filteredDates.map((v) => DateStatusUtils.buildLabel(v.date));
        return filteredDatesISO.filter((item, pos, self) => {
            return self.indexOf(item) === pos;
        });
    }

    /**
     * Gets the focus date and title for a given index
     */
    public static getFocusDateAndTitle(
        oldFocusDate: Date,
        focusRange: DateRange,
        index: number,
        min: Date,
        _max: Date
    ) {
        const newFocusDate = new Date(oldFocusDate);
        let newTitle = '...';

        if (focusRange === DateRange.YEAR) {
            newTitle = DateStatusUtils.buildLabelYear(newFocusDate, min.getUTCFullYear() + index);
        } else if (focusRange === DateRange.MONTH) {
            newTitle = DateStatusUtils.buildLabelMonth(newFocusDate, index);
        } else if (focusRange === DateRange.DAY) {
            newTitle = DateStatusUtils.buildLabelDay(newFocusDate, index + 1);
        } else if (focusRange === DateRange.HOUR) {
            newTitle = DateStatusUtils.buildLabelHour(newFocusDate, index, true);
        } else if (focusRange === DateRange.MINUTE) {
            newTitle = DateStatusUtils.buildLabelMinute(newFocusDate, index, true);
        }

        return {newFocusDate, newTitle};
    }

    /**
     * Builds a label for a date
     */
    public static buildLabel(date: Date): string {
        // "2024-03-28 13:02:48 CET"  l=23
        return Tools.formatDate(date, DateRange.MINUTE);
    }

    /**
     * Builds a label for a year
     */
    public static buildLabelYear(date: Date, year: number): string {
        date.setUTCFullYear(year);
        date.setUTCMonth(0);
        date.setUTCDate(1);
        date.setUTCHours(0);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        return Tools.formatDate(date, DateRange.YEAR);
    }

    /**
     * Builds a label for a month
     */
    public static buildLabelMonth(date: Date, month: number): string {
        date.setUTCMonth(month);
        date.setUTCDate(1);
        date.setUTCHours(0);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        return Tools.formatDate(date, DateRange.MONTH);
    }

    /**
     * Builds a label for a day
     */
    public static buildLabelDay(date: Date, dateNumber: number): string {
        date.setUTCDate(dateNumber);
        date.setUTCHours(0);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        return Tools.formatDate(date, DateRange.DAY);
    }

    /**
     * Builds a label for an hour
     */
    public static buildLabelHour(date: Date, hour: number, withLocal = false): string {
        date.setUTCHours(hour);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        const utcFormatted = Tools.formatDate(date, DateRange.HOUR);

        if (withLocal) {
            const local = new Date(date);
            const userTimezoneOffset = local.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - userTimezoneOffset);
            const localFormatted = Tools.formatDate(localDate, DateRange.HOUR);
            return `${localFormatted}`;
        } else {
            return `UTC ${utcFormatted}`;
        }
    }

    /**
     * Builds a label for a minute
     */
    public static buildLabelMinute(date: Date, minute: number, withLocal = false): string {
        date.setUTCMinutes(minute);
        date.setUTCSeconds(0);
        const utcFormatted = Tools.formatDate(date, DateRange.MINUTE);
        if (withLocal) {
            const local = new Date(date);
            const userTimezoneOffset = local.getTimezoneOffset() * 60000;
            const localDate = new Date(date.getTime() - userTimezoneOffset);
            const localFormatted = Tools.formatDate(localDate, DateRange.MINUTE);
            return `${localFormatted}`;
        } else {
            return `UTC ${utcFormatted}`;
        }
    }
}
