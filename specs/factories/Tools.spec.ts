import {expect} from 'chai';
import {DateRange, Tools} from '../../src';

describe('Factories.Tools', () => {

    it('shouldformatDate', async () => {

        expect(Tools.formatDate(new Date(0), DateRange.CENTURY)).eq('1970');
        expect(Tools.formatDate(new Date(0), DateRange.YEAR)).eq('1970');
        expect(Tools.formatDate(new Date(0), DateRange.MONTH)).eq('1970-01');
        expect(Tools.formatDate(new Date(0), DateRange.DAY)).eq('1970-01-01');
        expect(Tools.formatDate(new Date(0), DateRange.HOUR)).contains('1970-01-01 0'); // 01h depending on local
        expect(Tools.formatDate(new Date(0), DateRange.MINUTE)).contains('1970-01-01 0'); // 01:00 depending on local
    });
});
