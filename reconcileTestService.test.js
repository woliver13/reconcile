const { SampleDataService } = require('./src/sampleDataService');

describe('SampleDataService', () => {
    let service;

    beforeEach(() => {
        service = new SampleDataService();
    });

    describe('set()', () => {
        it('does not call alert()', () => {
            global.alert = jest.fn();
            service.set('1', 'A');
            expect(global.alert).not.toHaveBeenCalled();
        });
    });

    describe('undo()', () => {
        it('does not call alert()', () => {
            global.alert = jest.fn();
            service.undo('1', 'A');
            expect(global.alert).not.toHaveBeenCalled();
        });
    });

    describe('dateOfBirth formatting in standardised list A', () => {
        let listA;

        beforeEach(async () => {
            const data = await service.load();
            listA = data.a;
        });

        it('formats July as month 07, not 06', () => {
            // Nick: new Date(1966, 6, 6) = 6 July 1966 — getMonth() returns 6 (0-indexed)
            const nick = listA.find(item => item.firstName === 'Nick');
            expect(nick.dateOfBirth).toBe('19660706');
        });

        it('formats February as month 02 with leading zero', () => {
            // Dale: new Date(1935, 1, 12) = 12 February 1935
            const dale = listA.find(item => item.firstName === 'Dale');
            expect(dale.dateOfBirth).toBe('19350212');
        });
    });
});
