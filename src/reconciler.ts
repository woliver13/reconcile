import { IService, IView, Item, Candidate, Match, ActionEvent } from './types';

const WEIGHTS = { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 } as const;

export class Reconciler {
    readonly WEIGHTS = WEIGHTS;

    private position = 0;
    private listA: Item[] = [];
    private listB: Item[] = [];
    private readonly memento: Match[] = [];
    private readonly idProperty = 'id';

    constructor(private readonly service: IService, private readonly view: IView) {
        view.onAction('next',  () => this.next());
        view.onAction('prev',  () => this.prev());
        view.onAction('undo',  () => this.undo());
        view.onAction('match', (e) => this.match(e));
    }

    async init(): Promise<void> {
        try {
            const data = await this.service.load();
            this.listA = data.a;
            this.listB = data.b;
            this.redraw();
        } catch (status) {
            this.view.showError(status);
        }
    }

    next(): void {
        this.position++;
        if (this.position >= this.listA.length) this.position = 0;
        this.redraw();
    }

    prev(): void {
        this.position--;
        if (this.position < 0) this.position = this.listA.length - 1;
        this.redraw();
    }

    match(event: ActionEvent): void {
        const { a: aId, b: bId } = event;
        if (!aId || !bId) return;
        this.service.set(aId, bId);
        const lastMatch: Match = {
            a: this.listA.find(item => item[this.idProperty] === aId)!,
            b: this.listB.find(item => item[this.idProperty] === bId)!,
        };
        this.memento.push(lastMatch);
        this.listA = this.listA.filter(item => item[this.idProperty] !== aId);
        this.listB = this.listB.filter(item => item[this.idProperty] !== bId);
        this.redraw();
    }

    undo(): void {
        if (this.memento.length === 0) return;
        const lastMatch = this.memento.pop()!;
        this.service.undo(lastMatch.a[this.idProperty] as string, lastMatch.b[this.idProperty] as string);
        this.listA.push(lastMatch.a);
        this.listB.push(lastMatch.b);
        this.position = this.listA.length - 1;
        this.redraw();
    }

    private redraw(): void {
        const matchItem = this.listA[this.position];
        this.view.load(matchItem, this.getCandidates(matchItem, this.listB), this.listA, this.listB, this.memento);
    }

    private getCandidates(matchItem: Item, list: Item[]): Candidate[] {
        if (matchItem == null) return [];
        const result = list.map(item => {
            const candidate: Record<string, unknown> = {};
            const weights: Record<string, number> = {};
            let matchTotal = 0;
            Object.keys(item).forEach(key => {
                candidate[key] = item[key];
                if (key !== this.idProperty) {
                    weights[key] = this.getWeight(item[key], matchItem[key]);
                    matchTotal += weights[key];
                }
            });
            weights['matchTotal'] = matchTotal;
            candidate['weights'] = weights;
            return candidate as Candidate;
        });
        return result
            .filter(item => item.weights['matchTotal'] > 0)
            .sort((a, b) => b.weights['matchTotal'] - a.weights['matchTotal']);
    }

    private getWeight(cell1: unknown, cell2: unknown): number {
        if (cell1 == null) return 0;
        if (cell2 == null) return 0;
        if (cell1 === cell2) return WEIGHTS.EXACT;
        if (this.isSameWs(cell1, cell2)) return WEIGHTS.WHITESPACE;
        if (this.doesContain(cell1, cell2)) return WEIGHTS.CONTAINS;
        return 0;
    }

    private isSameWs(cell1: unknown, cell2: unknown): boolean {
        return String(cell1).toUpperCase().replace(/\s/g, '') === String(cell2).toUpperCase().replace(/\s/g, '');
    }

    private doesContain(cell1: unknown, cell2: unknown): boolean {
        const s1 = String(cell1).toUpperCase();
        const s2 = String(cell2).toUpperCase();
        return s1.includes(s2) || s2.includes(s1);
    }
}
