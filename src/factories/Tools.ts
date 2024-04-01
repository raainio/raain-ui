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

export enum FocusRange {
    CENTURY,
    YEAR,
    MONTH,
    DAY,
    HOUR
}

export class Tools {

    public static getTransparency(value: string, opacity: number) {
        const alpha = opacity === undefined ? 0.5 : 1 - opacity;
        return colorLib(value).alpha(alpha).rgbString();
    }
}
