export type ActionType = 'next' | 'prev' | 'undo' | 'match';

export interface ActionEvent {
    type: ActionType;
    a?: string;
    b?: string;
}

export interface Item {
    id: string;
    [key: string]: unknown;
}

export interface Candidate extends Item {
    weights: Record<string, number>;
}

export interface Match {
    a: Item;
    b: Item;
}

export interface IService {
    load(): Promise<{ a: Item[]; b: Item[] }>;
    set(aId: string, bId: string): void;
    undo(aId: string, bId: string): void;
}

export interface IView {
    load(matchItem: Item, candidates: Candidate[], listA: Item[], listB: Item[], memento: Match[]): void;
    showError(status: unknown): void;
    onAction(type: ActionType, listener: (e: ActionEvent) => void): void;
}
