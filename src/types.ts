export const ID_PROPERTY = 'id';
export const MATCH_TOTAL = 'matchTotal';

export interface Weights {
    EXACT: number;
    WHITESPACE: number;
    NICKNAME: number;
    CONTAINS: number;
    TRANSPOSITION: number;
}

export type ColumnWeights = Record<string, Partial<Weights>>;

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

export interface Difference {
    field: string;
    aValue: unknown;
    bValue: unknown;
}

export interface IService {
    /** Fetches both datasets. @returns Object with parallel `a` and `b` item arrays. */
    load(): Promise<{ a: Item[]; b: Item[] }>;
    /** Records a confirmed match. @param aId ID of the item from list A. @param bId ID of the item from list B. @param currentUsername Auditing user. @param differences Field-level diff to store alongside the match. */
    set(aId: string, bId: string, currentUsername: string, differences: Difference[]): void;
    /** Removes a previously confirmed match. @param aId ID of the item from list A. @param bId ID of the item from list B. */
    undo(aId: string, bId: string): void;
}

export interface IView {
    /** Renders the current match item together with its scored candidates. @param matchItem The item from list A currently under review. @param candidates Scored and sorted items from list B. @param listA Full list A for context. @param listB Full list B for context. @param memento Previously confirmed matches available for undo. */
    load(matchItem: Item, candidates: Candidate[], listA: Item[], listB: Item[], memento: Match[]): void;
    /** Displays a non-fatal error to the user. @param status Raw error value (HTTP status, Error object, etc.). */
    showError(status: unknown): void;
    /** Registers a listener for user-driven navigation or match actions. @param type The action category to listen for. @param listener Callback invoked with the full action event. */
    onAction(type: ActionType, listener: (e: ActionEvent) => void): void;
}
