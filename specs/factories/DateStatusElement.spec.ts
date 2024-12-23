import {expect} from 'chai';
import {JSDOM} from 'jsdom';
import {DateRange, DateStatusElement, DateStatusElementInput} from '../../src';

describe('Factories.DateStatusElement', () => {

    const dateStatusPoints1 = [
        {date: new Date('2022-05-01 13:05'), value: 2},
        {date: new Date('2023-05-01 13:05'), value: 2},
        {date: new Date('2023-06-01 13:05'), value: 2},
        {date: new Date('2023-06-02'), value: 1},
        {date: new Date('2023-06-02 13:12'), value: 3},
        {date: new Date('2023-06-02 14:39'), value: 5}];
    const dateStatusPoints2 = [
        {date: new Date('2023-05-12 11:05'), value: 5},
        {date: new Date('2023-04-02 13:15'), value: 8},
        {date: new Date('2023-06-02 13:15'), value: 7},
        {date: new Date('2023-06-02 13:19'), value: 6},
        {date: new Date('2023-06-02 13:29'), value: 5},
        {date: new Date('2023-06-02 14:29'), value: 5},
        {date: new Date('2023-06-12 13:22'), value: 3},
        {date: new Date('2024-06-12 13:22'), value: 3}];
    const setOfDates = [
        {label: 'data 1', style: 'bar', values: dateStatusPoints1},
        {label: 'data 2', style: 'bar', values: dateStatusPoints2},
        {label: 'data 2 with lines', style: 'line', values: dateStatusPoints2},
    ];

    beforeEach(() => {
    });

    it('should build and navigate', async () => {
        const fakeDom = new JSDOM(`<!DOCTYPE html><canvas id="myChart" width="400" height="400"></canvas>`);
        const canvasElement = fakeDom.window.document.querySelector('#myChart');
        canvasElement.getContext = () => {
            return {};
        };

        const dateStatusElementInput = new DateStatusElementInput(setOfDates,
            new Date('2023-06-01'),
            DateRange.DAY);
        const dateStatusElement = new DateStatusElement();
        dateStatusElement.build(canvasElement, dateStatusElementInput);

        const created: any = dateStatusElement.chart;
        expect(created).not.eq(undefined);
        created.update = () => {
        };

        // default
        expect(created.focusRange).eq(DateRange.DAY);
        expect(created.focusPos).eq(0);
        expect(created.config['_config'].options.plugins.title.text).eq(' ');
        expect(created.data.labels.toString()).eq('2023-06-01 00h,2023-06-01 01h,2023-06-01 02h,2023-06-01 03h,2023-06-01 04h,2023-06-01 05h,2023-06-01 06h,2023-06-01 07h,2023-06-01 08h,2023-06-01 09h,2023-06-01 10h,2023-06-01 11h,2023-06-01 12h,2023-06-01 13h,2023-06-01 14h,2023-06-01 15h,2023-06-01 16h,2023-06-01 17h,2023-06-01 18h,2023-06-01 19h,2023-06-01 20h,2023-06-01 21h,2023-06-01 22h,2023-06-01 23h');

        // next
        dateStatusElement.focusNext();
        expect(created.focusRange).eq(DateRange.DAY);
        expect(created.focusPos).eq(1);
        expect(created.config['_config'].options.plugins.title.text).eq('2023-06-02');
        expect(created.data.labels.toString()).eq('2023-06-02 00h,2023-06-02 01h,2023-06-02 02h,2023-06-02 03h,2023-06-02 04h,2023-06-02 05h,2023-06-02 06h,2023-06-02 07h,2023-06-02 08h,2023-06-02 09h,2023-06-02 10h,2023-06-02 11h,2023-06-02 12h,2023-06-02 13h,2023-06-02 14h,2023-06-02 15h,2023-06-02 16h,2023-06-02 17h,2023-06-02 18h,2023-06-02 19h,2023-06-02 20h,2023-06-02 21h,2023-06-02 22h,2023-06-02 23h');

        // click
        dateStatusElement.getFocusPosRelative = (e, c) => {
            return 13;
        };
        dateStatusElement.focusClick({chart: created});
        expect(created.focusRange).eq(DateRange.HOUR);
        expect(created.focusPos).eq(13);
        expect(created.config['_config'].options.plugins.title.text).eq('2023-06-02 13h');
        expect(created.data.labels.toString()).eq('2023-06-02 13:00,2023-06-02 13:01,2023-06-02 13:02,2023-06-02 13:03,2023-06-02 13:04,2023-06-02 13:05,2023-06-02 13:06,2023-06-02 13:07,2023-06-02 13:08,2023-06-02 13:09,2023-06-02 13:10,2023-06-02 13:11,2023-06-02 13:12,2023-06-02 13:13,2023-06-02 13:14,2023-06-02 13:15,2023-06-02 13:16,2023-06-02 13:17,2023-06-02 13:18,2023-06-02 13:19,2023-06-02 13:20,2023-06-02 13:21,2023-06-02 13:22,2023-06-02 13:23,2023-06-02 13:24,2023-06-02 13:25,2023-06-02 13:26,2023-06-02 13:27,2023-06-02 13:28,2023-06-02 13:29,2023-06-02 13:30,2023-06-02 13:31,2023-06-02 13:32,2023-06-02 13:33,2023-06-02 13:34,2023-06-02 13:35,2023-06-02 13:36,2023-06-02 13:37,2023-06-02 13:38,2023-06-02 13:39,2023-06-02 13:40,2023-06-02 13:41,2023-06-02 13:42,2023-06-02 13:43,2023-06-02 13:44,2023-06-02 13:45,2023-06-02 13:46,2023-06-02 13:47,2023-06-02 13:48,2023-06-02 13:49,2023-06-02 13:50,2023-06-02 13:51,2023-06-02 13:52,2023-06-02 13:53,2023-06-02 13:54,2023-06-02 13:55,2023-06-02 13:56,2023-06-02 13:57,2023-06-02 13:58,2023-06-02 13:59');

        // next
        dateStatusElement.focusNext();
        expect(created.focusRange).eq(DateRange.HOUR);
        expect(created.focusPos).eq(14);
        expect(created.config['_config'].options.plugins.title.text).eq('2023-06-02 14h');
        expect(created.data.labels.toString()).eq('2023-06-02 14:00,2023-06-02 14:01,2023-06-02 14:02,2023-06-02 14:03,2023-06-02 14:04,2023-06-02 14:05,2023-06-02 14:06,2023-06-02 14:07,2023-06-02 14:08,2023-06-02 14:09,2023-06-02 14:10,2023-06-02 14:11,2023-06-02 14:12,2023-06-02 14:13,2023-06-02 14:14,2023-06-02 14:15,2023-06-02 14:16,2023-06-02 14:17,2023-06-02 14:18,2023-06-02 14:19,2023-06-02 14:20,2023-06-02 14:21,2023-06-02 14:22,2023-06-02 14:23,2023-06-02 14:24,2023-06-02 14:25,2023-06-02 14:26,2023-06-02 14:27,2023-06-02 14:28,2023-06-02 14:29,2023-06-02 14:30,2023-06-02 14:31,2023-06-02 14:32,2023-06-02 14:33,2023-06-02 14:34,2023-06-02 14:35,2023-06-02 14:36,2023-06-02 14:37,2023-06-02 14:38,2023-06-02 14:39,2023-06-02 14:40,2023-06-02 14:41,2023-06-02 14:42,2023-06-02 14:43,2023-06-02 14:44,2023-06-02 14:45,2023-06-02 14:46,2023-06-02 14:47,2023-06-02 14:48,2023-06-02 14:49,2023-06-02 14:50,2023-06-02 14:51,2023-06-02 14:52,2023-06-02 14:53,2023-06-02 14:54,2023-06-02 14:55,2023-06-02 14:56,2023-06-02 14:57,2023-06-02 14:58,2023-06-02 14:59');

        // previous
        dateStatusElement.focusPrevious();
        expect(created.focusRange).eq(DateRange.HOUR);
        expect(created.focusPos).eq(13);
        expect(created.config['_config'].options.plugins.title.text).eq('2023-06-02 13h');
        expect(created.data.labels.toString()).eq('2023-06-02 13:00,2023-06-02 13:01,2023-06-02 13:02,2023-06-02 13:03,2023-06-02 13:04,2023-06-02 13:05,2023-06-02 13:06,2023-06-02 13:07,2023-06-02 13:08,2023-06-02 13:09,2023-06-02 13:10,2023-06-02 13:11,2023-06-02 13:12,2023-06-02 13:13,2023-06-02 13:14,2023-06-02 13:15,2023-06-02 13:16,2023-06-02 13:17,2023-06-02 13:18,2023-06-02 13:19,2023-06-02 13:20,2023-06-02 13:21,2023-06-02 13:22,2023-06-02 13:23,2023-06-02 13:24,2023-06-02 13:25,2023-06-02 13:26,2023-06-02 13:27,2023-06-02 13:28,2023-06-02 13:29,2023-06-02 13:30,2023-06-02 13:31,2023-06-02 13:32,2023-06-02 13:33,2023-06-02 13:34,2023-06-02 13:35,2023-06-02 13:36,2023-06-02 13:37,2023-06-02 13:38,2023-06-02 13:39,2023-06-02 13:40,2023-06-02 13:41,2023-06-02 13:42,2023-06-02 13:43,2023-06-02 13:44,2023-06-02 13:45,2023-06-02 13:46,2023-06-02 13:47,2023-06-02 13:48,2023-06-02 13:49,2023-06-02 13:50,2023-06-02 13:51,2023-06-02 13:52,2023-06-02 13:53,2023-06-02 13:54,2023-06-02 13:55,2023-06-02 13:56,2023-06-02 13:57,2023-06-02 13:58,2023-06-02 13:59');

        // reset
        dateStatusElement.focusReset();
        expect(created.focusRange).eq(DateRange.CENTURY);
        expect(created.focusPos).eq(0);
        expect(created.config['_config'].options.plugins.title.text).eq('...');
        expect(created.data.labels.toString()).eq('2022,2023,2024');
    });


    it('should build and navigate on different levels', async () => {
        const fakeDom = new JSDOM(`<!DOCTYPE html><canvas id="myChart" width="400" height="400"></canvas>`);
        const canvasElement = fakeDom.window.document.querySelector('#myChart');
        canvasElement.getContext = () => {
            return {};
        };

        const dateStatusElementInput = new DateStatusElementInput(setOfDates,
            new Date('2023-12'),
            DateRange.MONTH);
        const dateStatusElement = new DateStatusElement();
        dateStatusElement.build(canvasElement, dateStatusElementInput);

        const created: any = dateStatusElement.chart;
        expect(created).not.eq(undefined);
        created.update = () => {
        };

        // actual
        expect(created.focusRange).eq(DateRange.MONTH);
        expect(created.focusPos).eq(11);

        // next
        dateStatusElement.focusNext();
        expect(created.focusRange).eq(DateRange.MONTH);
        expect(created.focusPos).eq(0);
        expect(created.config['_config'].options.plugins.title.text).eq('2024-01');
        expect(created.data.labels.toString()).eq('2024-01-01,2024-01-02,2024-01-03,2024-01-04,2024-01-05,2024-01-06,2024-01-07,2024-01-08,2024-01-09,2024-01-10,2024-01-11,2024-01-12,2024-01-13,2024-01-14,2024-01-15,2024-01-16,2024-01-17,2024-01-18,2024-01-19,2024-01-20,2024-01-21,2024-01-22,2024-01-23,2024-01-24,2024-01-25,2024-01-26,2024-01-27,2024-01-28,2024-01-29,2024-01-30,2024-01-31');

        // previous
        dateStatusElement.focusPrevious();
        expect(created.focusRange).eq(DateRange.MONTH);
        expect(created.focusPos).eq(11);
        expect(created.config['_config'].options.plugins.title.text).eq('2023-12');
        expect(created.data.labels.toString()).eq('2023-12-01,2023-12-02,2023-12-03,2023-12-04,2023-12-05,2023-12-06,2023-12-07,2023-12-08,2023-12-09,2023-12-10,2023-12-11,2023-12-12,2023-12-13,2023-12-14,2023-12-15,2023-12-16,2023-12-17,2023-12-18,2023-12-19,2023-12-20,2023-12-21,2023-12-22,2023-12-23,2023-12-24,2023-12-25,2023-12-26,2023-12-27,2023-12-28,2023-12-29,2023-12-30');

        // reset
        dateStatusElement.focusReset();
        expect(created.focusRange).eq(DateRange.CENTURY);
        expect(created.focusPos).eq(0);
        expect(created.config['_config'].options.plugins.title.text).eq('...');
        expect(created.data.labels.toString()).eq('2022,2023,2024');
    });
});
