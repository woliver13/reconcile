import { IView, Item, Candidate, Match, ActionType, ActionEvent, ID_PROPERTY, MATCH_TOTAL } from './types';

export class TableView implements IView {
    private readonly listeners: Partial<Record<ActionType, Array<(e: ActionEvent) => void>>> = {};
    private readonly columnColors = ['#ffff00', '#add8e6', '#90ee90', '#ffb6c1', '#ffa07a', '#dda0dd'];

    constructor(
        private readonly masterDiv: HTMLElement,
    ) {}

    load(matchItem: Item, candidates: Candidate[], listA: Item[], listB: Item[], memento: Match[]): void {
        this.masterDiv.innerHTML = '';
        if (listA.length > 0) {
            const mismatchColors = this.getMismatchColors(matchItem, candidates);
            const table = document.createElement('table');
            table.style.width = '100%';

            const thead = document.createElement('thead');
            thead.append(this.buildHeaderRow(matchItem));
            table.append(thead);

            const tbody = document.createElement('tbody');
            tbody.append(this.buildMatchRow(matchItem, mismatchColors));
            this.buildCandidateRows(matchItem, candidates, mismatchColors).forEach(row => tbody.append(row));
            table.append(tbody);

            this.masterDiv.append(table);

            const controlBar = document.createElement('div');
            controlBar.append(this.buildPrevButton(), this.buildUndoButton(memento.length > 0));
            this.masterDiv.append(controlBar);

            if (candidates.length === 1 || candidates[0].weights[MATCH_TOTAL] > candidates[1].weights[MATCH_TOTAL]) {
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

    private td(content?: string): HTMLTableCellElement {
        const cell = document.createElement('td');
        if (content !== undefined) cell.textContent = content;
        return cell;
    }

    private getMismatchColors(matchItem: Item, candidates: Candidate[]): Record<string, string> {
        const colors: Record<string, string> = {};
        let colorIdx = 0;
        Object.keys(matchItem)
            .filter(k => k !== ID_PROPERTY)
            .forEach(key => {
                if (candidates.some(c => c[key] !== matchItem[key])) {
                    colors[key] = this.columnColors[colorIdx % this.columnColors.length];
                    colorIdx++;
                }
            });
        return colors;
    }

    private buildHeaderRow(matchItem: Item): HTMLTableRowElement {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = '#000';
        tr.style.color = '#fff';
        Object.keys(matchItem).forEach(key => {
            if (key !== ID_PROPERTY) {
                const th = document.createElement('th');
                th.textContent = key;
                tr.append(th);
            }
        });
        tr.append(document.createElement('th')); // button column
        return tr;
    }

    private buildMatchRow(matchItem: Item, mismatchColors: Record<string, string>): HTMLTableRowElement {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '3px solid #333';
        Object.keys(matchItem).forEach(key => {
            if (key !== ID_PROPERTY) {
                const cell = this.td(String(matchItem[key]));
                if (mismatchColors[key]) cell.style.backgroundColor = mismatchColors[key];
                tr.append(cell);
            }
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-warning';
        nextBtn.setAttribute('accesskey', 'n');
        nextBtn.textContent = 'No Match';
        nextBtn.addEventListener('click', () => this.next());

        const btnCell = this.td();
        btnCell.append(nextBtn);
        tr.append(btnCell);
        return tr;
    }

    private buildPrevButton(): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.setAttribute('accesskey', 'p');
        btn.textContent = 'Previous';
        btn.addEventListener('click', () => this.prev());
        return btn;
    }

    private buildUndoButton(canUndo: boolean): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.setAttribute('accesskey', 'u');
        btn.textContent = 'Undo';
        btn.addEventListener('click', () => this.undo());
        if (!canUndo) btn.disabled = true;
        return btn;
    }

    private buildCandidateRows(matchItem: Item, candidates: Candidate[], mismatchColors: Record<string, string>): HTMLTableRowElement[] {
        return candidates.map((item, index) => {
            const tr = document.createElement('tr');
            Object.keys(item).forEach(key => {
                if (key !== ID_PROPERTY && key !== 'weights') {
                    const cell = this.td(String(item[key]));
                    if (mismatchColors[key] && item[key] !== matchItem[key]) {
                        cell.style.backgroundColor = mismatchColors[key];
                    }
                    tr.append(cell);
                }
            });

            const btn = document.createElement('button');
            btn.className = 'btn btn-success';
            if (index === 0) btn.setAttribute('accesskey', 'm');
            btn.setAttribute('data-a', String(matchItem[ID_PROPERTY]));
            btn.setAttribute('data-b', String(item[ID_PROPERTY]));
            btn.textContent = 'Match';
            btn.addEventListener('click', (e) => this.match(e));
            const btnCell = this.td();
            btnCell.append(btn);
            tr.append(btnCell);
            return tr;
        });
    }
}
