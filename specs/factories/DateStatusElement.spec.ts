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
            'UTC 2023-06-01 00h,UTC 2023-06-01 01h,UTC 2023-06-01 02h,UTC 2023-06-01 03h,UTC 2023-06-01 04h,UTC 2023-06-01 05h,UTC 2023-06-01 06h,UTC 2023-06-01 07h,UTC 2023-06-01 08h,UTC 2023-06-01 09h,UTC 2023-06-01 10h,UTC 2023-06-01 11h,UTC 2023-06-01 12h,UTC 2023-06-01 13h,UTC 2023-06-01 14h,UTC 2023-06-01 15h,UTC 2023-06-01 16h,UTC 2023-06-01 17h,UTC 2023-06-01 18h,UTC 2023-06-01 19h,UTC 2023-06-01 20h,UTC 2023-06-01 21h,UTC 2023-06-01 22h,UTC 2023-06-01 23h'
        );

        // next
        await dateStatusElement.focusNext();
        expect(dateStatusElement.focusRange).eq(DateRange.DAY);
        expect(dateStatusElement.focusPos).eq(1);
        expect(dateStatusElement.chartTitle).eq('2023-06-02');
        expect(created.data.labels.toString()).eq(
            'UTC 2023-06-02 00h,UTC 2023-06-02 01h,UTC 2023-06-02 02h,UTC 2023-06-02 03h,UTC 2023-06-02 04h,UTC 2023-06-02 05h,UTC 2023-06-02 06h,UTC 2023-06-02 07h,UTC 2023-06-02 08h,UTC 2023-06-02 09h,UTC 2023-06-02 10h,UTC 2023-06-02 11h,UTC 2023-06-02 12h,UTC 2023-06-02 13h,UTC 2023-06-02 14h,UTC 2023-06-02 15h,UTC 2023-06-02 16h,UTC 2023-06-02 17h,UTC 2023-06-02 18h,UTC 2023-06-02 19h,UTC 2023-06-02 20h,UTC 2023-06-02 21h,UTC 2023-06-02 22h,UTC 2023-06-02 23h'
        );

        // click
        dateStatusElement.getFocusPosRelative = (e, c) => {
            return 13;
        };
        await dateStatusElement.focusClick({chart: created});
        expect(dateStatusElement.focusRange).eq(DateRange.HOUR);
        expect(dateStatusElement.focusPos).eq(13);
        expect(dateStatusElement.chartTitle).eq('UTC 2023-06-02 13h - Local 2023-06-02 15h');
        expect(created.data.labels.toString()).eq(
            'UTC 2023-06-02 13:00,UTC 2023-06-02 13:01,UTC 2023-06-02 13:02,UTC 2023-06-02 13:03,UTC 2023-06-02 13:04,UTC 2023-06-02 13:05,UTC 2023-06-02 13:06,UTC 2023-06-02 13:07,UTC 2023-06-02 13:08,UTC 2023-06-02 13:09,UTC 2023-06-02 13:10,UTC 2023-06-02 13:11,UTC 2023-06-02 13:12,UTC 2023-06-02 13:13,UTC 2023-06-02 13:14,UTC 2023-06-02 13:15,UTC 2023-06-02 13:16,UTC 2023-06-02 13:17,UTC 2023-06-02 13:18,UTC 2023-06-02 13:19,UTC 2023-06-02 13:20,UTC 2023-06-02 13:21,UTC 2023-06-02 13:22,UTC 2023-06-02 13:23,UTC 2023-06-02 13:24,UTC 2023-06-02 13:25,UTC 2023-06-02 13:26,UTC 2023-06-02 13:27,UTC 2023-06-02 13:28,UTC 2023-06-02 13:29,UTC 2023-06-02 13:30,UTC 2023-06-02 13:31,UTC 2023-06-02 13:32,UTC 2023-06-02 13:33,UTC 2023-06-02 13:34,UTC 2023-06-02 13:35,UTC 2023-06-02 13:36,UTC 2023-06-02 13:37,UTC 2023-06-02 13:38,UTC 2023-06-02 13:39,UTC 2023-06-02 13:40,UTC 2023-06-02 13:41,UTC 2023-06-02 13:42,UTC 2023-06-02 13:43,UTC 2023-06-02 13:44,UTC 2023-06-02 13:45,UTC 2023-06-02 13:46,UTC 2023-06-02 13:47,UTC 2023-06-02 13:48,UTC 2023-06-02 13:49,UTC 2023-06-02 13:50,UTC 2023-06-02 13:51,UTC 2023-06-02 13:52,UTC 2023-06-02 13:53,UTC 2023-06-02 13:54,UTC 2023-06-02 13:55,UTC 2023-06-02 13:56,UTC 2023-06-02 13:57,UTC 2023-06-02 13:58,UTC 2023-06-02 13:59'
        );

        // next
        await dateStatusElement.focusNext();
        expect(dateStatusElement.focusRange).eq(DateRange.HOUR);
        expect(dateStatusElement.focusPos).eq(14);
        expect(dateStatusElement.chartTitle).eq('UTC 2023-06-02 14h - Local 2023-06-02 16h');
        expect(created.data.labels.toString()).eq(
            'UTC 2023-06-02 14:00,UTC 2023-06-02 14:01,UTC 2023-06-02 14:02,UTC 2023-06-02 14:03,UTC 2023-06-02 14:04,UTC 2023-06-02 14:05,UTC 2023-06-02 14:06,UTC 2023-06-02 14:07,UTC 2023-06-02 14:08,UTC 2023-06-02 14:09,UTC 2023-06-02 14:10,UTC 2023-06-02 14:11,UTC 2023-06-02 14:12,UTC 2023-06-02 14:13,UTC 2023-06-02 14:14,UTC 2023-06-02 14:15,UTC 2023-06-02 14:16,UTC 2023-06-02 14:17,UTC 2023-06-02 14:18,UTC 2023-06-02 14:19,UTC 2023-06-02 14:20,UTC 2023-06-02 14:21,UTC 2023-06-02 14:22,UTC 2023-06-02 14:23,UTC 2023-06-02 14:24,UTC 2023-06-02 14:25,UTC 2023-06-02 14:26,UTC 2023-06-02 14:27,UTC 2023-06-02 14:28,UTC 2023-06-02 14:29,UTC 2023-06-02 14:30,UTC 2023-06-02 14:31,UTC 2023-06-02 14:32,UTC 2023-06-02 14:33,UTC 2023-06-02 14:34,UTC 2023-06-02 14:35,UTC 2023-06-02 14:36,UTC 2023-06-02 14:37,UTC 2023-06-02 14:38,UTC 2023-06-02 14:39,UTC 2023-06-02 14:40,UTC 2023-06-02 14:41,UTC 2023-06-02 14:42,UTC 2023-06-02 14:43,UTC 2023-06-02 14:44,UTC 2023-06-02 14:45,UTC 2023-06-02 14:46,UTC 2023-06-02 14:47,UTC 2023-06-02 14:48,UTC 2023-06-02 14:49,UTC 2023-06-02 14:50,UTC 2023-06-02 14:51,UTC 2023-06-02 14:52,UTC 2023-06-02 14:53,UTC 2023-06-02 14:54,UTC 2023-06-02 14:55,UTC 2023-06-02 14:56,UTC 2023-06-02 14:57,UTC 2023-06-02 14:58,UTC 2023-06-02 14:59'
        );

        // previous
        await dateStatusElement.focusPrevious();
        expect(dateStatusElement.focusRange).eq(DateRange.HOUR);
        expect(dateStatusElement.focusPos).eq(13);
        expect(dateStatusElement.chartTitle).eq('UTC 2023-06-02 13h - Local 2023-06-02 15h');
        expect(created.data.labels.toString()).eq(
            'UTC 2023-06-02 13:00,UTC 2023-06-02 13:01,UTC 2023-06-02 13:02,UTC 2023-06-02 13:03,UTC 2023-06-02 13:04,UTC 2023-06-02 13:05,UTC 2023-06-02 13:06,UTC 2023-06-02 13:07,UTC 2023-06-02 13:08,UTC 2023-06-02 13:09,UTC 2023-06-02 13:10,UTC 2023-06-02 13:11,UTC 2023-06-02 13:12,UTC 2023-06-02 13:13,UTC 2023-06-02 13:14,UTC 2023-06-02 13:15,UTC 2023-06-02 13:16,UTC 2023-06-02 13:17,UTC 2023-06-02 13:18,UTC 2023-06-02 13:19,UTC 2023-06-02 13:20,UTC 2023-06-02 13:21,UTC 2023-06-02 13:22,UTC 2023-06-02 13:23,UTC 2023-06-02 13:24,UTC 2023-06-02 13:25,UTC 2023-06-02 13:26,UTC 2023-06-02 13:27,UTC 2023-06-02 13:28,UTC 2023-06-02 13:29,UTC 2023-06-02 13:30,UTC 2023-06-02 13:31,UTC 2023-06-02 13:32,UTC 2023-06-02 13:33,UTC 2023-06-02 13:34,UTC 2023-06-02 13:35,UTC 2023-06-02 13:36,UTC 2023-06-02 13:37,UTC 2023-06-02 13:38,UTC 2023-06-02 13:39,UTC 2023-06-02 13:40,UTC 2023-06-02 13:41,UTC 2023-06-02 13:42,UTC 2023-06-02 13:43,UTC 2023-06-02 13:44,UTC 2023-06-02 13:45,UTC 2023-06-02 13:46,UTC 2023-06-02 13:47,UTC 2023-06-02 13:48,UTC 2023-06-02 13:49,UTC 2023-06-02 13:50,UTC 2023-06-02 13:51,UTC 2023-06-02 13:52,UTC 2023-06-02 13:53,UTC 2023-06-02 13:54,UTC 2023-06-02 13:55,UTC 2023-06-02 13:56,UTC 2023-06-02 13:57,UTC 2023-06-02 13:58,UTC 2023-06-02 13:59'
        );

        // reset
        await dateStatusElement.focusReset();
        expect(dateStatusElement.focusRange).eq(DateRange.DAY);
        expect(dateStatusElement.focusPos).eq(0);
        expect(created.config['_config'].options.plugins.title.text).eq(' ');
        expect(created.data.labels.toString()).eq(
            'UTC 2023-06-01 00h,UTC 2023-06-01 01h,UTC 2023-06-01 02h,UTC 2023-06-01 03h,UTC 2023-06-01 04h,UTC 2023-06-01 05h,UTC 2023-06-01 06h,UTC 2023-06-01 07h,UTC 2023-06-01 08h,UTC 2023-06-01 09h,UTC 2023-06-01 10h,UTC 2023-06-01 11h,UTC 2023-06-01 12h,UTC 2023-06-01 13h,UTC 2023-06-01 14h,UTC 2023-06-01 15h,UTC 2023-06-01 16h,UTC 2023-06-01 17h,UTC 2023-06-01 18h,UTC 2023-06-01 19h,UTC 2023-06-01 20h,UTC 2023-06-01 21h,UTC 2023-06-01 22h,UTC 2023-06-01 23h'
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
