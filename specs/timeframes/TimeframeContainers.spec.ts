// @ts-ignore
import {PolarMapValue, TimeframeContainers} from '../../src';
import {expect} from 'chai';

describe('TimeframeContainers', () => {

    it('should create a basic TimeframeContainers', async () => {
        const containers = new TimeframeContainers([]);

        expect(containers.containers.length).eq(0);
    });
});
