import {expect} from 'chai';
import {JSDOM} from 'jsdom';
import {DateRange, DateStatusElement, DateStatusElementInput} from '../../src';
import * as sinon from 'sinon';

describe('Factories.DateStatusElement', () => {
    const dateStatusPoints1 = [
        {date: new Date('2022-05-01 13:05'), value: 2},
        {date: new Date('2023-05-01 13:05'), value: 2},
        {date: new Date('2023-06-01 13:05'), value: 2},
        {date: new Date('2023-06-02'), value: 1},
        {date: new Date('2023-06-02 13:12'), value: 3},
        {date: new Date('2023-06-02 14:39'), value: 5},
    ];
    const dateStatusPoints2 = [
        {date: new Date('2023-05-12 11:05'), value: 5},
        {date: new Date('2023-04-02 13:15'), value: 8},
        {date: new Date('2023-06-02 13:15'), value: 7},
        {date: new Date('2023-06-02 13:19'), value: 6},
        {date: new Date('2023-06-02 13:29'), value: 5},
        {date: new Date('2023-06-02 14:29'), value: 5},
        {date: new Date('2023-06-12 13:22'), value: 3},
        {date: new Date('2024-06-12 13:22'), value: 3},
    ];
    const setOfDates = [
        {label: 'data 1', style: 'bar', values: dateStatusPoints1},
        {label: 'data 2', style: 'bar', values: dateStatusPoints2},
        {label: 'data 2 with lines', style: 'line', values: dateStatusPoints2},
    ];

    let timezoneStub;

    beforeEach(() => {
        // Stub the timezone offset to always return -120 minutes (UTC+2)
        // This ensures the test is consistent regardless of where it runs
        timezoneStub = sinon.stub(Date.prototype, 'getTimezoneOffset').returns(-120);
    });

    afterEach(() => {
        // Restore the original method after each test
        timezoneStub.restore();
    });

    it('should build and navigate', async () => {
        const fakeDom = new JSDOM(
            `<!DOCTYPE html><canvas id="myChart" width="400" height="400"></canvas>`
        );
        const canvasElement = fakeDom.window.document.querySelector('#myChart');
        (canvasElement as any).getContext = () => {
            return {};
        };

        const utcDate = new Date(0, 0, 0, 0, 0, 0, 0);
        utcDate.setUTCFullYear(2023, 5, 1);

        const dateStatusElementInput = new DateStatusElementInput(
            setOfDates,
            utcDate,
            DateRange.DAY
        );
        const dateStatusElement = new DateStatusElement();
        dateStatusElement.build(canvasElement as HTMLCanvasElement, dateStatusElementInput);

        const created: any = dateStatusElement.chart;
        expect(created).not.eq(undefined);
        created.update = () => {};

        // default
        expect(dateStatusElement.focusRange).eq(DateRange.DAY);
        expect(dateStatusElement.focusPos).eq(0);
        expect(dateStatusElement.chartTitle).eq(' ');
        expect(created.data.labels.toString()).eq(
            '2023-06-01 02h,2023-06-01 03h,2023-06-01 04h,2023-06-01 05h,2023-06-01 06h,2023-06-01 07h,2023-06-01 08h,2023-06-01 09h,2023-06-01 10h,2023-06-01 11h,2023-06-01 12h,2023-06-01 13h,2023-06-01 14h,2023-06-01 15h,2023-06-01 16h,2023-06-01 17h,2023-06-01 18h,2023-06-01 19h,2023-06-01 20h,2023-06-01 21h,2023-06-01 22h,2023-06-01 23h,2023-06-02 00h,2023-06-02 01h'
        );

        // next
        await dateStatusElement.focusNext();
        expect(dateStatusElement.focusRange).eq(DateRange.DAY);
        expect(dateStatusElement.focusPos).eq(1);
        expect(dateStatusElement.chartTitle).eq('2023-06-02');
        expect(created.data.labels.toString()).eq(
            '2023-06-02 02h,2023-06-02 03h,2023-06-02 04h,2023-06-02 05h,2023-06-02 06h,2023-06-02 07h,2023-06-02 08h,2023-06-02 09h,2023-06-02 10h,2023-06-02 11h,2023-06-02 12h,2023-06-02 13h,2023-06-02 14h,2023-06-02 15h,2023-06-02 16h,2023-06-02 17h,2023-06-02 18h,2023-06-02 19h,2023-06-02 20h,2023-06-02 21h,2023-06-02 22h,2023-06-02 23h,2023-06-03 00h,2023-06-03 01h'
        );

        // click
        dateStatusElement.getFocusPosRelative = (e, c) => {
            return 13;
        };
        await dateStatusElement.focusClick({chart: created});
        expect(dateStatusElement.focusRange).eq(DateRange.HOUR);
        expect(dateStatusElement.focusPos).eq(13);
        expect(dateStatusElement.chartTitle).eq('2023-06-02 15h');
        expect(created.data.labels.toString()).eq(
            '2023-06-02 15:00,2023-06-02 15:01,2023-06-02 15:02,2023-06-02 15:03,2023-06-02 15:04,2023-06-02 15:05,2023-06-02 15:06,2023-06-02 15:07,2023-06-02 15:08,2023-06-02 15:09,2023-06-02 15:10,2023-06-02 15:11,2023-06-02 15:12,2023-06-02 15:13,2023-06-02 15:14,2023-06-02 15:15,2023-06-02 15:16,2023-06-02 15:17,2023-06-02 15:18,2023-06-02 15:19,2023-06-02 15:20,2023-06-02 15:21,2023-06-02 15:22,2023-06-02 15:23,2023-06-02 15:24,2023-06-02 15:25,2023-06-02 15:26,2023-06-02 15:27,2023-06-02 15:28,2023-06-02 15:29,2023-06-02 15:30,2023-06-02 15:31,2023-06-02 15:32,2023-06-02 15:33,2023-06-02 15:34,2023-06-02 15:35,2023-06-02 15:36,2023-06-02 15:37,2023-06-02 15:38,2023-06-02 15:39,2023-06-02 15:40,2023-06-02 15:41,2023-06-02 15:42,2023-06-02 15:43,2023-06-02 15:44,2023-06-02 15:45,2023-06-02 15:46,2023-06-02 15:47,2023-06-02 15:48,2023-06-02 15:49,2023-06-02 15:50,2023-06-02 15:51,2023-06-02 15:52,2023-06-02 15:53,2023-06-02 15:54,2023-06-02 15:55,2023-06-02 15:56,2023-06-02 15:57,2023-06-02 15:58,2023-06-02 15:59'
        );

        // next
        await dateStatusElement.focusNext();
        expect(dateStatusElement.focusRange).eq(DateRange.HOUR);
        expect(dateStatusElement.focusPos).eq(14);
        expect(dateStatusElement.chartTitle).eq('2023-06-02 16h');
        expect(created.data.labels.toString()).eq(
            '2023-06-02 16:00,2023-06-02 16:01,2023-06-02 16:02,2023-06-02 16:03,2023-06-02 16:04,2023-06-02 16:05,2023-06-02 16:06,2023-06-02 16:07,2023-06-02 16:08,2023-06-02 16:09,2023-06-02 16:10,2023-06-02 16:11,2023-06-02 16:12,2023-06-02 16:13,2023-06-02 16:14,2023-06-02 16:15,2023-06-02 16:16,2023-06-02 16:17,2023-06-02 16:18,2023-06-02 16:19,2023-06-02 16:20,2023-06-02 16:21,2023-06-02 16:22,2023-06-02 16:23,2023-06-02 16:24,2023-06-02 16:25,2023-06-02 16:26,2023-06-02 16:27,2023-06-02 16:28,2023-06-02 16:29,2023-06-02 16:30,2023-06-02 16:31,2023-06-02 16:32,2023-06-02 16:33,2023-06-02 16:34,2023-06-02 16:35,2023-06-02 16:36,2023-06-02 16:37,2023-06-02 16:38,2023-06-02 16:39,2023-06-02 16:40,2023-06-02 16:41,2023-06-02 16:42,2023-06-02 16:43,2023-06-02 16:44,2023-06-02 16:45,2023-06-02 16:46,2023-06-02 16:47,2023-06-02 16:48,2023-06-02 16:49,2023-06-02 16:50,2023-06-02 16:51,2023-06-02 16:52,2023-06-02 16:53,2023-06-02 16:54,2023-06-02 16:55,2023-06-02 16:56,2023-06-02 16:57,2023-06-02 16:58,2023-06-02 16:59'
        );

        // previous
        await dateStatusElement.focusPrevious();
        expect(dateStatusElement.focusRange).eq(DateRange.HOUR);
        expect(dateStatusElement.focusPos).eq(13);
        expect(dateStatusElement.chartTitle).eq('2023-06-02 15h');
        expect(created.data.labels.toString()).eq(
            '2023-06-02 15:00,2023-06-02 15:01,2023-06-02 15:02,2023-06-02 15:03,2023-06-02 15:04,2023-06-02 15:05,2023-06-02 15:06,2023-06-02 15:07,2023-06-02 15:08,2023-06-02 15:09,2023-06-02 15:10,2023-06-02 15:11,2023-06-02 15:12,2023-06-02 15:13,2023-06-02 15:14,2023-06-02 15:15,2023-06-02 15:16,2023-06-02 15:17,2023-06-02 15:18,2023-06-02 15:19,2023-06-02 15:20,2023-06-02 15:21,2023-06-02 15:22,2023-06-02 15:23,2023-06-02 15:24,2023-06-02 15:25,2023-06-02 15:26,2023-06-02 15:27,2023-06-02 15:28,2023-06-02 15:29,2023-06-02 15:30,2023-06-02 15:31,2023-06-02 15:32,2023-06-02 15:33,2023-06-02 15:34,2023-06-02 15:35,2023-06-02 15:36,2023-06-02 15:37,2023-06-02 15:38,2023-06-02 15:39,2023-06-02 15:40,2023-06-02 15:41,2023-06-02 15:42,2023-06-02 15:43,2023-06-02 15:44,2023-06-02 15:45,2023-06-02 15:46,2023-06-02 15:47,2023-06-02 15:48,2023-06-02 15:49,2023-06-02 15:50,2023-06-02 15:51,2023-06-02 15:52,2023-06-02 15:53,2023-06-02 15:54,2023-06-02 15:55,2023-06-02 15:56,2023-06-02 15:57,2023-06-02 15:58,2023-06-02 15:59'
        );

        // reset
        await dateStatusElement.focusReset();
        expect(dateStatusElement.focusRange).eq(DateRange.DAY);
        expect(dateStatusElement.focusPos).eq(0);
        expect(created.config['_config'].options.plugins.title.text).eq(' ');
        expect(created.data.labels.toString()).eq(
            '2023-06-01 02h,2023-06-01 03h,2023-06-01 04h,2023-06-01 05h,2023-06-01 06h,2023-06-01 07h,2023-06-01 08h,2023-06-01 09h,2023-06-01 10h,2023-06-01 11h,2023-06-01 12h,2023-06-01 13h,2023-06-01 14h,2023-06-01 15h,2023-06-01 16h,2023-06-01 17h,2023-06-01 18h,2023-06-01 19h,2023-06-01 20h,2023-06-01 21h,2023-06-01 22h,2023-06-01 23h,2023-06-02 00h,2023-06-02 01h'
        );
    });

    it('should build and navigate on different levels', async () => {
        const fakeDom = new JSDOM(
            `<!DOCTYPE html><canvas id="myChart" width="400" height="400"></canvas>`
        );
        const canvasElement = fakeDom.window.document.querySelector('#myChart');
        (canvasElement as any).getContext = () => {
            return {};
        };

        const utcDate = new Date(0, 0, 0, 0, 0, 0, 0);
        utcDate.setUTCFullYear(2023, 11);

        const dateStatusElementInput = new DateStatusElementInput(
            setOfDates,
            utcDate,
            DateRange.MONTH
        );
        const dateStatusElement = new DateStatusElement();
        dateStatusElement.build(canvasElement as HTMLCanvasElement, dateStatusElementInput);

        const created: any = dateStatusElement.chart;
        expect(created).not.eq(undefined);
        created.update = () => {};

        // actual
        expect(dateStatusElement.focusRange).eq(DateRange.MONTH);
        expect(dateStatusElement.focusPos).eq(11);

        // next
        await dateStatusElement.focusNext();
        expect(dateStatusElement.focusRange).eq(DateRange.MONTH);
        expect(dateStatusElement.focusPos).eq(0);
        expect(created.config['_config'].options.plugins.title.text).eq('2024-01');
        expect(created.data.labels.toString()).eq(
            '2024-01-01,2024-01-02,2024-01-03,2024-01-04,2024-01-05,2024-01-06,2024-01-07,2024-01-08,2024-01-09,2024-01-10,2024-01-11,2024-01-12,2024-01-13,2024-01-14,2024-01-15,2024-01-16,2024-01-17,2024-01-18,2024-01-19,2024-01-20,2024-01-21,2024-01-22,2024-01-23,2024-01-24,2024-01-25,2024-01-26,2024-01-27,2024-01-28,2024-01-29,2024-01-30,2024-01-31'
        );

        // previous
        await dateStatusElement.focusPrevious();
        expect(dateStatusElement.focusRange).eq(DateRange.MONTH);
        expect(dateStatusElement.focusPos).eq(11);
        expect(created.config['_config'].options.plugins.title.text).eq('2023-12');
        expect(created.data.labels.toString()).eq(
            '2023-12-01,2023-12-02,2023-12-03,2023-12-04,2023-12-05,2023-12-06,2023-12-07,2023-12-08,2023-12-09,2023-12-10,2023-12-11,2023-12-12,2023-12-13,2023-12-14,2023-12-15,2023-12-16,2023-12-17,2023-12-18,2023-12-19,2023-12-20,2023-12-21,2023-12-22,2023-12-23,2023-12-24,2023-12-25,2023-12-26,2023-12-27,2023-12-28,2023-12-29,2023-12-30,2023-12-31'
        );

        // reset
        await dateStatusElement.focusReset();
        expect(dateStatusElement.focusRange).eq(DateRange.MONTH);
        expect(dateStatusElement.focusPos).eq(0);
        expect(created.config['_config'].options.plugins.title.text).eq(' ');
        expect(created.data.labels.toString()).eq(
            '2023-12-01,2023-12-02,2023-12-03,2023-12-04,2023-12-05,2023-12-06,2023-12-07,2023-12-08,2023-12-09,2023-12-10,2023-12-11,2023-12-12,2023-12-13,2023-12-14,2023-12-15,2023-12-16,2023-12-17,2023-12-18,2023-12-19,2023-12-20,2023-12-21,2023-12-22,2023-12-23,2023-12-24,2023-12-25,2023-12-26,2023-12-27,2023-12-28,2023-12-29,2023-12-30,2023-12-31'
        );
    });
});
