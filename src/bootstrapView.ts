import $ from 'jquery';
import { IView, Item, Candidate, Match, ActionType, ActionEvent } from './types';

interface Weights {
    EXACT: number;
    WHITESPACE: number;
    CONTAINS: number;
}

export class BootstrapView implements IView {
    private readonly idProperty = 'id';
    private readonly listeners: Partial<Record<ActionType, Array<(e: ActionEvent) => void>>> = {};

    constructor(
        private readonly masterDiv: JQuery,
        private readonly weights: Weights,
    ) {}

    load(matchItem: Item, candidates: Candidate[], listA: Item[], listB: Item[], memento: Match[]): void {
        this.masterDiv.empty();
        if (listA.length > 0) {
            this.masterDiv.append(this.buildMatchLine(matchItem, memento.length > 0));
            this.masterDiv.append(this.buildHeaderDiv(matchItem));
            this.buildCandidates(matchItem, candidates).forEach(el => this.masterDiv.append(el));
            if (candidates.length === 1 || candidates[0].weights['matchTotal'] > candidates[1].weights['matchTotal']) {
                $('button:contains("Match")').first().focus();
            }
        }
    }

    showError(status: unknown): void {
        this.masterDiv.empty();
        this.masterDiv.append($('<div>').text(String(status)));
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
    private match(e: JQuery.ClickEvent): void {
        this.dispatch({
            type: 'match',
            a: $(e.target).attr('data-a'),
            b: $(e.target).attr('data-b'),
        });
    }

    private buildMatchLine(matchItem: Item, canUndo: boolean): JQuery {
        const row = $('<div class="row">');
        Object.keys(matchItem).forEach(key => {
            if (key !== this.idProperty) row.append($('<div class="col-md-1">' + matchItem[key] + '</div>'));
        });
        row.append($('<div class="col-md-1"><button class="btn" accesskey="n">Next</button></div>'));
        row.append($('<div class="col-md-1"><button class="btn" accesskey="p">Prev</button></div>'));
        row.append($('<div class="col-md-1"><button class="btn" accesskey="u">Undo</button></div>'));
        $(row).find('button:contains("Next")').on('click', () => this.next());
        $(row).find('button:contains("Prev")').on('click', () => this.prev());
        $(row).find('button:contains("Undo")').on('click', () => this.undo());
        if (!canUndo) $(row).find('button:contains("Undo")').prop('disabled', 'disabled');
        return row;
    }

    private buildHeaderDiv(matchItem: Item): JQuery {
        const header = $('<div class="row" style="background-color:#000;color:#fff">');
        Object.keys(matchItem).forEach(key => {
            if (key !== this.idProperty) header.append($('<div class="col-md-1">' + key + '</div>'));
        });
        return header;
    }

    private buildCandidates(matchItem: Item, candidates: Candidate[]): JQuery[] {
        return candidates.map((item, index) => {
            const row = $('<div class="row">');
            Object.keys(item).forEach(key => {
                if (key !== this.idProperty && key !== 'weights') {
                    const cell = $('<div class="col-md-1">' + item[key] + '</div>');
                    if (item.weights[key] === this.weights.EXACT)      cell.addClass('match-same');
                    if (item.weights[key] === this.weights.WHITESPACE)  cell.addClass('match-samews');
                    if (item.weights[key] === this.weights.CONTAINS)    cell.addClass('match-contains');
                    row.append(cell);
                }
            });
            const btn = $('<button class="btn"' + (index === 0 ? ' accesskey="m"' : '') +
                ' data-a="' + matchItem[this.idProperty] + '" data-b="' + item[this.idProperty] + '">Match</button>');
            $(btn).on('click', (e) => this.match(e));
            row.append($('<div class="col-md-1">').append(btn));
            return row;
        });
    }
}
