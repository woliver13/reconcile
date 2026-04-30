import { IService, IView, Item, Match, ActionEvent, Difference, ID_PROPERTY } from './types';
import { Scorer } from './scorer';

export class Reconciler {
    private position = 0;
    private listA: Item[] = [];
    private listB: Item[] = [];
    private readonly memento: Match[] = [];

    constructor(
        private readonly service: IService,
        private readonly view: IView,
        private readonly scorer: Scorer,
        private readonly currentUsername: string = '',
    ) {
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
        } catch (error) {
            this.view.showError(error);
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

    private computeDifferences(a: Item, b: Item): Difference[] {
        const differences: Difference[] = [];
        for (const field of Object.keys(a)) {
            if (field === ID_PROPERTY) continue;
            if (a[field] !== b[field]) {
                differences.push({ field, aValue: a[field], bValue: b[field] });
            }
        }
        return differences;
    }

    match(event: ActionEvent): void {
        const { a: aId, b: bId } = event;
        if (!aId || !bId) return;
        const aItem = this.listA.find(item => item[ID_PROPERTY] === aId);
        const bItem = this.listB.find(item => item[ID_PROPERTY] === bId);
        if (!aItem || !bItem) return;
        const differences = this.computeDifferences(aItem, bItem);
        this.service.set(aId, bId, this.currentUsername, differences);
        const lastMatch: Match = { a: aItem, b: bItem };
        this.memento.push(lastMatch);
        this.listA = this.listA.filter(item => item[ID_PROPERTY] !== aId);
        this.listB = this.listB.filter(item => item[ID_PROPERTY] !== bId);
        this.redraw();
    }

    undo(): void {
        if (this.memento.length === 0) return;
        const lastMatch = this.memento.pop()!;
        this.service.undo(lastMatch.a[ID_PROPERTY] as string, lastMatch.b[ID_PROPERTY] as string);
        this.listA.push(lastMatch.a);
        this.listB.push(lastMatch.b);
        this.position = this.listA.length - 1;
        this.redraw();
    }

    private redraw(): void {
        const matchItem = this.listA[this.position];
        this.view.load(matchItem, this.scorer.getCandidates(matchItem, this.listB), this.listA, this.listB, this.memento);
    }
}
