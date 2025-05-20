import {expect} from 'chai';
import {DateRange, Tools} from '../../src';

describe('Factories.Tools', () => {

    it('should formatDate', async () => {

        expect(Tools.formatDate(new Date(0), DateRange.CENTURY)).eq('1970');
        expect(Tools.formatDate(new Date(0), DateRange.YEAR)).eq('1970');
        expect(Tools.formatDate(new Date(0), DateRange.MONTH)).eq('1970-01');
        expect(Tools.formatDate(new Date(0), DateRange.DAY)).eq('1970-01-01');
        expect(Tools.formatDate(new Date(0), DateRange.HOUR)).contains('1970-01-01 0'); // 01h depending on local
        expect(Tools.formatDate(new Date(0), DateRange.MINUTE)).contains('1970-01-01 0'); // 01:00 depending on local
    });

    it('should convert RGB string to hex', async () => {
        // Test basic RGB to hex conversion
        expect(Tools.rgbStringToHex('rgb(255, 0, 0)')).eq('#ff0000');
        expect(Tools.rgbStringToHex('rgb(0, 255, 0)')).eq('#00ff00');
        expect(Tools.rgbStringToHex('rgb(0, 0, 255)')).eq('#0000ff');
        expect(Tools.rgbStringToHex('rgb(255, 255, 255)')).eq('#ffffff');
        expect(Tools.rgbStringToHex('rgb(0, 0, 0)')).eq('#000000');

        // Test RGB values with single digits
        expect(Tools.rgbStringToHex('rgb(5, 10, 15)')).eq('#050a0f');

        // Test error cases
        try {
            Tools.rgbStringToHex('invalid');
            expect.fail('Should have thrown an error for invalid RGB string');
        } catch (error) {
            expect(error.message).eq('Invalid RGB string format');
        }
    });
});
