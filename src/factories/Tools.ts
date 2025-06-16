import colorLib from '@kurkle/color';

export enum DateRange {
    CENTURY,
    YEAR,
    MONTH,
    DAY,
    HOUR,
    MINUTE,
}

export class Tools {
    public static getTransparency(value: string, transparency: number) {
        const alpha = transparency === undefined ? 0.5 : 1 - transparency;
        return colorLib(value).alpha(alpha).rgbString();
    }

    public static rgbStringToHex(rgbString) {
        // Use a regular expression to extract the RGB values
        const match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) {
            throw new Error('Invalid RGB string format');
        }

        // Extract the red, green, and blue components
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);

        // Ensure the RGB values are within the valid range (0-255)
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
            throw new Error('RGB values must be between 0 and 255');
        }

        // Convert each component to a two-digit hexadecimal string
        const toHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        // Concatenate the hexadecimal strings
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    public static formatDate(date: Date, dateRange: number) {
        const yyyy = date.getUTCFullYear();
        const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(date.getUTCDate()).padStart(2, '0');
        const hh = String(date.getUTCHours()).padStart(2, '0');
        const min = String(date.getUTCMinutes()).padStart(2, '0');

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
