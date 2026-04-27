import { IView, Item, Candidate, Match, ActionType, ActionEvent, Weights } from './types';

export class BootstrapView implements IView {
    private readonly idProperty = 'id';
    private readonly listeners: Partial<Record<ActionType, Array<(e: ActionEvent) => void>>> = {};
    private readonly columnColors = ['#ffff00', '#add8e6', '#90ee90', '#ffb6c1', '#ffa07a', '#dda0dd'];

    constructor(
        private readonly masterDiv: HTMLElement,
        private readonly weights: Weights,
    ) {}

    load(matchItem: Item, candidates: Candidate[], listA: Item[], listB: Item[], memento: Match[]): void {
        this.masterDiv.innerHTML = '';
        if (listA.length > 0) {
            const mismatchColors = this.getMismatchColors(matchItem, candidates);
            this.masterDiv.append(this.buildMatchLine(matchItem, memento.length > 0, mismatchColors));
            this.masterDiv.append(this.buildHeaderDiv(matchItem));
            this.buildCandidates(matchItem, candidates, mismatchColors).forEach(el => this.masterDiv.append(el));
            if (candidates.length === 1 || candidates[0].weights['matchTotal'] > candidates[1].weights['matchTotal']) {
                const matchBtn = this.masterDiv.querySelector<HTMLButtonElement>('button[data-b]');
                matchBtn?.focus();
            }
        }
    }

    showError(status: unknown): void {
        this.masterDiv.innerHTML = '';
        const div = document.createElement('div');
        div.textContent = String(status);
        this.masterDiv.append(div);
    }

    onAction(type: ActionType, listener: (e: ActionEvent) => void): void {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type]!.push(listener);
    }

    private dispatch(e: ActionEvent): void {
        (this.listeners[e.type] ?? []).forEach(fn => fn(e));
    }

    private next(): void  { this.dispatch({ type: 'next' }); }
    private prev(): void  { this.dispatch({ type: 'prev' }); }
    private undo(): void  { this.dispatch({ type: 'undo' }); }
    private match(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        this.dispatch({
            type: 'match',
            a: target.getAttribute('data-a') ?? undefined,
            b: target.getAttribute('data-b') ?? undefined,
        });
    }

    private el(tag: string, className: string): HTMLElement {
        const elem = document.createElement(tag);
        elem.className = className;
        return elem;
    }

    private getMismatchColors(matchItem: Item, candidates: Candidate[]): Record<string, string> {
        const colors: Record<string, string> = {};
        let colorIdx = 0;
        Object.keys(matchItem)
            .filter(k => k !== this.idProperty)
            .forEach(key => {
                if (candidates.some(c => c[key] !== matchItem[key])) {
                    colors[key] = this.columnColors[colorIdx % this.columnColors.length];
                    colorIdx++;
                }
            });
        return colors;
    }

    private buildMatchLine(matchItem: Item, canUndo: boolean, mismatchColors: Record<string, string>): HTMLElement {
        const row = this.el('div', 'row');
        Object.keys(matchItem).forEach(key => {
            if (key !== this.idProperty) {
                const cell = this.el('div', 'col-md-1');
                cell.textContent = String(matchItem[key]);
                if (mismatchColors[key]) cell.style.backgroundColor = mismatchColors[key];
                row.append(cell);
            }
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn';
        nextBtn.setAttribute('accesskey', 'n');
        nextBtn.textContent = 'No Match';
        nextBtn.addEventListener('click', () => this.next());

        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn';
        prevBtn.setAttribute('accesskey', 'p');
        prevBtn.textContent = 'Prev';
        prevBtn.addEventListener('click', () => this.prev());

        const undoBtn = document.createElement('button');
        undoBtn.className = 'btn';
        undoBtn.setAttribute('accesskey', 'u');
        undoBtn.textContent = 'Undo';
        undoBtn.addEventListener('click', () => this.undo());
        if (!canUndo) undoBtn.disabled = true;

        const nextWrap = this.el('div', 'col-md-1');
        nextWrap.append(nextBtn);
        const prevWrap = this.el('div', 'col-md-1');
        prevWrap.append(prevBtn);
        const undoWrap = this.el('div', 'col-md-1');
        undoWrap.append(undoBtn);

        row.append(nextWrap, prevWrap, undoWrap);
        return row;
    }

    private buildHeaderDiv(matchItem: Item): HTMLElement {
        const header = this.el('div', 'row');
        header.style.backgroundColor = '#000';
        header.style.color = '#fff';
        Object.keys(matchItem).forEach(key => {
            if (key !== this.idProperty) {
                const cell = this.el('div', 'col-md-1');
                cell.textContent = key;
                header.append(cell);
            }
        });
        return header;
    }

    private buildCandidates(matchItem: Item, candidates: Candidate[], mismatchColors: Record<string, string>): HTMLElement[] {
        return candidates.map((item, index) => {
            const row = this.el('div', 'row');
            Object.keys(item).forEach(key => {
                if (key !== this.idProperty && key !== 'weights') {
                    const cell = this.el('div', 'col-md-1');
                    cell.textContent = String(item[key]);
                    if (mismatchColors[key] && item[key] !== matchItem[key]) {
                        cell.style.backgroundColor = mismatchColors[key];
                    }
                    row.append(cell);
                }
            });
            const btn = document.createElement('button');
            btn.className = 'btn';
            if (index === 0) btn.setAttribute('accesskey', 'm');
            btn.setAttribute('data-a', String(matchItem[this.idProperty]));
            btn.setAttribute('data-b', String(item[this.idProperty]));
            btn.textContent = 'Match';
            btn.addEventListener('click', (e) => this.match(e));
            const wrap = this.el('div', 'col-md-1');
            wrap.append(btn);
            row.append(wrap);
            return row;
        });
    }
}
