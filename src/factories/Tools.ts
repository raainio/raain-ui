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
