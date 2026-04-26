import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SampleDataService } from './src/sampleDataService';

describe('SampleDataService', () => {
    let service;

    beforeEach(() => {
        service = new SampleDataService();
    });

    describe('set()', () => {
        it('does not call alert()', () => {
            vi.stubGlobal('alert', vi.fn());
            service.set('1', 'A');
            expect(global.alert).not.toHaveBeenCalled();
            vi.unstubAllGlobals();
        });
    });

    describe('undo()', () => {
        it('does not call alert()', () => {
            vi.stubGlobal('alert', vi.fn());
            service.undo('1', 'A');
            expect(global.alert).not.toHaveBeenCalled();
            vi.unstubAllGlobals();
        });
    });

    describe('dateOfBirth formatting in standardised list A', () => {
        let listA;

        beforeEach(async () => {
            const data = await service.load();
            listA = data.a;
        });

        it('formats July as month 07, not 06', () => {
            const nick = listA.find(item => item.firstName === 'Nick');
            expect(nick.dateOfBirth).toBe('19660706');
        });

        it('formats February as month 02 with leading zero', () => {
            const dale = listA.find(item => item.firstName === 'Dale');
            expect(dale.dateOfBirth).toBe('19350212');
        });
    });
});
