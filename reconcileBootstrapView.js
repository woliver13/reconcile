(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root.reconcileBootstrapView = factory(root.$);
    }
}(this, function($) {
    let masterDiv = null;
    let showList = false;
    let idProperty = 'id';
    let weights = { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 };

    const setWeights = function(w) { weights = w; };

    const setMasterDiv = function(div) { masterDiv = div; };
    const setShowList = function(showList1) { showList = showList1; };
    const setIdProperty = function(prop) { idProperty = prop; };

    const buildMatchLine = function(matchItem, canUndo) {
        const matchDiv = $('<div class="row">');
        Object.keys(matchItem).forEach(function(key) {
            if (key != idProperty) {
                const cellDiv = $('<div class="col-md-1">' + matchItem[key] + '</div>');
                matchDiv.append(cellDiv);
            }
        });
        matchDiv.append($('<div class="col-md-1"><button class="btn" accesskey="n">Next</button></div>'));
        matchDiv.append($('<div class="col-md-1"><button class="btn" accesskey="p">Prev</button></div>'));
        matchDiv.append($('<div class="col-md-1"><button class="btn" accesskey="u">Undo</button></div>'));
        $(matchDiv).find('button:contains("Next")').on('click', next);
        $(matchDiv).find('button:contains("Prev")').on('click', prev);
        $(matchDiv).find('button:contains("Undo")').on('click', undo);
        if (!canUndo) {
            $(matchDiv).find('button:contains("Undo")').prop('disabled', 'disabled');
        }
        return matchDiv;
    };

    const buildHeaderDiv = function(matchItem) {
        const headerDiv = $('<div class="row" style="background-color:#000;color:#fff">');
        Object.keys(matchItem).forEach(function(key) {
            if (key != idProperty) {
                const cellDiv = $('<div class="col-md-1">' + key + '</div>');
                headerDiv.append(cellDiv);
            }
        });
        return headerDiv;
    };

    const buildCandidates = function(matchItem, candidates) {
        const result = candidates.map(function(item, index) {
            const candidateDiv = $('<div class="row">');
            Object.keys(item).forEach(function(key) {
                if (key != idProperty && key != 'weights') {
                    const cellDiv = $('<div class="col-md-1">' + item[key] + '</div>');
                    if (item.weights[key] == weights.EXACT) cellDiv.addClass('match-same');
                    if (item.weights[key] == weights.WHITESPACE) cellDiv.addClass('match-samews');
                    if (item.weights[key] == weights.CONTAINS) cellDiv.addClass('match-contains');
                    candidateDiv.append(cellDiv);
                }
            });
            const matchButton = $('<button class="btn"' + (index === 0 ? ' accesskey="m"' : '') + ' data-a="' + matchItem[idProperty] + '" data-b="' + item[idProperty] + '">Match</button>');
            $(matchButton).on('click', match);
            const newDiv = $('<div class="col-md-1">');
            newDiv.append(matchButton);
            candidateDiv.append(newDiv);
            return candidateDiv;
        });
        return result;
    };

    const buildList = function(list, listName) {
        const listId = listName.replace(' ', '_');
        const result = $('<div id="' + listId + '"><h3>' + listName + '</h3></div>');
        $.each(list, function(index, item) {
            const rowDiv = $('<div class="row">');
            Object.keys(item).forEach(function(key) {
                if (key != idProperty)
                    rowDiv.append($('<div class="col-md-1">' + item[key] + '</div>'));
            });
            result.append(rowDiv);
        });
        return result;
    };

    const load = function(matchItem, candidates, listA, listB, memento) {
        masterDiv.empty();
        if (listA.length > 0) {
            masterDiv.append(buildMatchLine(matchItem, memento.length > 0));
            masterDiv.append(buildHeaderDiv(matchItem));
            $.each(buildCandidates(matchItem, candidates), function(index, item) {
                masterDiv.append(item);
            });
            if (candidates.length == 1 || candidates[0].weights.matchTotal > candidates[1].weights.matchTotal)
                $('button:contains("Match")').first().focus();
        }
        if (showList) {
            masterDiv.append(buildList(listA, 'List A'));
            masterDiv.append(buildList(listB, 'List B'));
        }
    };

    const listeners = {};

    const addEvent = function(type, listener) {
        if (!listeners[type]) {
            listeners[type] = [];
        }
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    };

    const dispatchEvent = function(e) {
        const fireList = listeners[e.type];
        if (fireList) {
            if (!e.target) {
                e.target = this;
            }
            for (const fireFunction in fireList) {
                fireList[fireFunction](e);
            }
        }
    };
    const next = function() { dispatchEvent({ type: 'next' }); };
    const prev = function() { dispatchEvent({ type: 'prev' }); };
    const undo = function() { dispatchEvent({ type: 'undo' }); };
    const match = function(e) { dispatchEvent({ type: 'match', a: $(e.target).attr('data-a'), b: $(e.target).attr('data-b') }); };

    return {
        load: load,
        setMasterDiv: setMasterDiv,
        setShowList: setShowList,
        setIdProperty: setIdProperty,
        setWeights: setWeights,
        addEvent: addEvent,
        next: next,
        prev: prev,
        undo: undo,
        match: match
    };
}));
