(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root.reconcile = factory(root.$);
    }
}(this, function($) {
    let position = 0;
    let listA = [];
    let listB = [];
    const memento = [];
    let service = null;
    let view = null;
    let idProperty = 'id';

    const setService = function(service1) { service = service1; };
    const setView = function(view1) {
        view = view1;
        if (view1.addEvent) {
            view1.addEvent('next', next);
            view1.addEvent('prev', prev);
            view1.addEvent('undo', undo);
            view1.addEvent('match', match);
        }
    };
    const setIdProperty = function(prop) {
        idProperty = prop;
        view.setIdProperty(prop);
    };

    const next = function() {
        position++;
        if (position >= listA.length) position = 0;
        redraw();
    };

    const prev = function() {
        position--;
        if (position < 0) position = listA.length - 1;
        redraw();
    };

    const redraw = function() {
        const matchItem = listA[position];
        view.load(matchItem, getCandidates(matchItem, listB), listA, listB, memento);
    };

    const init = function() {
        $.when(service.load()).then(function(data) {
            listA = data.a;
            listB = data.b;
            redraw();
        }, function(status) {
            view.showError(status);
        });
    };

    const sortByMatchTotal = function(obj1, obj2) {
        if (obj1.weights['matchTotal'] > obj2.weights['matchTotal']) return -1;
        if (obj1.weights['matchTotal'] < obj2.weights['matchTotal']) return 1;
        return 0;
    };

    const getCandidates = function(matchItem, list) {
        if (matchItem == null) return [];
        const result = list.map(function(item) {
            const result2 = {};
            const weights = {};
            let matchTotal = 0;
            Object.keys(item).forEach(function(key) {
                result2[key] = item[key];
                if (key !== idProperty) {
                    weights[key] = getWeight(item[key], matchItem[key]);
                    matchTotal += weights[key];
                }
            });
            weights['matchTotal'] = matchTotal;
            result2.weights = weights;
            return result2;
        });
        return result.filter(function(item) { return item.weights['matchTotal'] > 0; }).sort(sortByMatchTotal);
    };

    const WEIGHTS = { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 };

    const getWeight = function(cell1, cell2) {
        if (cell1 == null) return 0;
        if (cell2 == null) return 0;
        if (cell1 === cell2) return WEIGHTS.EXACT;
        if (isSameWs(cell1, cell2)) return WEIGHTS.WHITESPACE;
        if (doesContain(cell1, cell2)) return WEIGHTS.CONTAINS;
        return 0;
    };

    const isSameWs = function(cell1, cell2) {
        if (cell1 == null) return false;
        if (cell2 == null) return false;
        return cell1.toString().toUpperCase().replace(/\s/g, '') === cell2.toString().toUpperCase().replace(/\s/g, '');
    };

    const doesContain = function(cell1, cell2) {
        if (cell1 == null) return false;
        if (cell2 == null) return false;
        if (cell1.toString().toUpperCase().indexOf(cell2.toString().toUpperCase()) > -1) return true;
        if (cell2.toString().toUpperCase().indexOf(cell1.toString().toUpperCase()) > -1) return true;
        return false;
    };

    const match = function(event) {
        service.set(event.a, event.b);
        const lastMatch = {
            a: listA.find(function(item) { return item[idProperty] === event.a; }),
            b: listB.find(function(item) { return item[idProperty] === event.b; })
        };
        memento.push(lastMatch);
        listA = listA.filter(function(item) { return item[idProperty] !== event.a; });
        listB = listB.filter(function(item) { return item[idProperty] !== event.b; });
        redraw();
    };

    const undo = function() {
        if (memento.length === 0) return;
        const lastMatch = memento.pop();
        service.undo(lastMatch.a[idProperty], lastMatch.b[idProperty]);
        listA.push(lastMatch.a);
        listB.push(lastMatch.b);
        position = listA.length - 1;
        redraw();
    };

    return {
        next: next,
        prev: prev,
        match: match,
        undo: undo,
        init: init,
        setService: setService,
        setView: setView,
        setIdProperty: setIdProperty,
        WEIGHTS: WEIGHTS
    };
}));
