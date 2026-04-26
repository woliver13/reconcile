import { IService, Item } from './types';

interface RawA {
    FirstName: string;
    LastName: string;
    DL: string;
    DOB: Date;
    PKey: number;
    SSN: string | null;
}

interface RawB {
    id: string;
    name: { last: string; first: string };
    drivers: string;
    dateOfBirth: string;
}

const RAW_LIST_A: RawA[] = [
    { FirstName: 'Nick',   LastName: 'Sarkosy',   DL: '123456789', DOB: new Date(1966, 6, 6),  PKey: 5, SSN: null },
    { FirstName: 'Dale',   LastName: 'Earnhardt',  DL: '123456780', DOB: new Date(1935, 1, 12), PKey: 4, SSN: '123456789' },
    { FirstName: 'Oliver', LastName: 'Clark',      DL: '123456782', DOB: new Date(1966, 6, 6),  PKey: 3, SSN: '123456123' },
];

const RAW_LIST_B: RawB[] = [
    { id: 'A', name: { last: 'Zarkosi',      first: 'Nicholas' }, drivers: '123456789', dateOfBirth: '19660606' },
    { id: 'B', name: { last: 'Earnhardt Sr', first: 'Dale'     }, drivers: '123456780', dateOfBirth: '19350112' },
    { id: 'C', name: { last: 'Earnhardt Jr', first: 'Dale'     }, drivers: '123456781', dateOfBirth: '19660606' },
    { id: 'D', name: { last: 'Oliver',       first: 'Clark'    }, drivers: '123456782', dateOfBirth: '19660606' },
];

function makeAStandard(item: RawA): Item {
    const dob = item.DOB;
    const year  = dob.getFullYear().toString();
    const month = ('0' + (dob.getMonth() + 1)).slice(-2);
    const day   = ('0' + dob.getDate()).slice(-2);
    return {
        id:          item.PKey.toString(),
        firstName:   item.FirstName,
        lastName:    item.LastName,
        gid:         item.DL,
        dateOfBirth: year + month + day,
        ssn:         item.SSN,
    };
}

function makeBStandard(item: RawB): Item {
    return {
        id:          item.id,
        firstName:   item.name.first,
        lastName:    item.name.last,
        gid:         item.drivers,
        dateOfBirth: item.dateOfBirth,
        ssn:         null,
    };
}

export class SampleDataService implements IService {
    async load(): Promise<{ a: Item[]; b: Item[] }> {
        return {
            a: RAW_LIST_A.map(makeAStandard),
            b: RAW_LIST_B.map(makeBStandard),
        };
    }

    set(aId: string, bId: string): void {
        console.log(`matching ${aId} => ${bId}`);
    }

    undo(aId: string, bId: string): void {
        console.log(`undoing ${aId} => ${bId}`);
    }
}
