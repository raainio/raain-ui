import {expect} from 'chai';
import {DateRange, Tools} from '../../src';

describe('Factories.Tools', () => {

    it('shouldformatDate', async () => {

        expect(Tools.formatDate(new Date(0), DateRange.CENTURY)).eq('1970');
        expect(Tools.formatDate(new Date(0), DateRange.YEAR)).eq('1970');
        expect(Tools.formatDate(new Date(0), DateRange.MONTH)).eq('1970-01');
        expect(Tools.formatDate(new Date(0), DateRange.DAY)).eq('1970-01-01');
        expect(Tools.formatDate(new Date(0), DateRange.HOUR)).eq('1970-01-01 01h');
        expect(Tools.formatDate(new Date(0), DateRange.MINUTE)).eq('1970-01-01 01:00');
    });
});
