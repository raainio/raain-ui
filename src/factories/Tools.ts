import colorLib from '@kurkle/color';

export const ChartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    greenCpu: 'rgb(58,241,10)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(163,163,164)',
    dark: 'rgb(68,72,80)',
};

export const ChartScaleColors = {
    0.4: 'rgb(2,46,160)',
    1: 'rgb(8,135,207)',
    3: 'rgb(36,202,209)',
    10: 'rgb(104,211,139)',
    20: 'rgb(174,222,71)',
    30: 'rgb(244,226,13)',
    50: 'rgb(244,182,12)',
    100: 'rgb(244,129,11)',
    150: 'rgb(244,53,8)',
    200: 'rgb(206,9,15)',
    250: 'rgb(124,5,31)',
    300: 'rgb(16,7,55)',
};

export enum DateRange {
    CENTURY,
    YEAR,
    MONTH,
    DAY,
    HOUR,
    MINUTE
}

export class Tools {

    public static getTransparency(value: string, transparency: number) {
        const alpha = transparency === undefined ? 0.5 : 1 - transparency;
        return colorLib(value).alpha(alpha).rgbString();
    }

    public static formatDate(date: Date, dateRange: number) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        if (dateRange === DateRange.CENTURY) {
            return `${yyyy}`;
        } else if (dateRange === DateRange.YEAR) {
            return `${yyyy}`;
        } else if (dateRange === DateRange.MONTH) {
            return `${yyyy}-${mm}`;
        } else if (dateRange === DateRange.DAY) {
            return `${yyyy}-${mm}-${dd}`;
        } else if (dateRange === DateRange.HOUR) {
            return `${yyyy}-${mm}-${dd} ${hh}h`;
        }

        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }
}
