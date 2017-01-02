(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root.reconcileBootstrapView = factory(root.$);
    }
}(this, function($) {
    var masterDiv = null;
    var showList = false;
    var idProperty = 'id';

    var setMasterDiv = function(div) { masterDiv = div; };
    var setShowList = function(showList1) { showList = showList1; };
    var setIdProperty = function(prop) { idProperty = prop; };

    var buildMatchLine = function(matchItem, canUndo) {
        var matchDiv = $('<div class="row">');
        for (var key in matchItem) {
            if (key != idProperty) {
                var cellDiv = $('<div class="col-md-1">' + matchItem[key] + '</div>');
                matchDiv.append(cellDiv);
            }
        }
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

    var buildHeaderDiv = function(matchItem) {
        var headerDiv = $('<div class="row" style="background-color:#000;color:#fff">');
        for (var key in matchItem) {
            if (key != idProperty) {
                var cellDiv = $('<div class="col-md-1">' + key + '</div>');
                headerDiv.append(cellDiv);
            }
        }
        return headerDiv;
    };

    var buildCandidates = function(matchItem, candidates) {
        var result = candidates.map(function(item) {
            var candidateDiv = $('<div class="row">');
            for (var key in item) {
                if (key != idProperty && key != 'weights') {
                    var cellDiv = $('<div class="col-md-1">' + item[key] + '</div>');
                    if (item.weights[key] == 100) cellDiv.addClass('match-same');
                    if (item.weights[key] == 80) cellDiv.addClass('match-samews');
                    if (item.weights[key] == 30) cellDiv.addClass('match-contains');
                    candidateDiv.append(cellDiv);
                }
            }
            var matchButton = $('<button class="btn" accesskey="m" data-a="' + matchItem[idProperty] + '" data-b="' + item[idProperty] + '">Match</button>');
            $(matchButton).on('click', match);
            var newDiv = $('<div class="col-md-1">');
            newDiv.append(matchButton);
            candidateDiv.append(newDiv);
            return candidateDiv;
        });
        return result;
    };

    var buildList = function(list, listName) {
        var listId = listName.replace(' ', '_');
        var result = $('<div id="' + listId + '"><h3>' + listName + '</h3></div>');
        $.each(list, function(index, item) {
            var rowDiv = $('<div class="row">');
            for (var key in item) {
                if (key != idProperty)
                    rowDiv.append($('<div class="col-md-1">' + item[key] + '</div>'));
            }
            result.append(rowDiv);
        });
        return result;
    };

    var load = function(matchItem, candidates, listA, listB, memento) {
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

    var listeners = {};

    var addEvent = function(type, listener) {
        if (!listeners[type]) {
            listeners[type] = [];
        }
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    };

    var dispatchEvent = function(e) {
        var fireList = listeners[e.type];
        if (fireList) {
            if (!e.target) {
                e.target = this;
            }
            for (var fireFunction in fireList) {
                fireList[fireFunction](e);
            }
        }
    };
    var next = function() { dispatchEvent({ type: 'next' }); };
    var prev = function() { dispatchEvent({ type: 'prev' }); };
    var undo = function() { dispatchEvent({ type: 'undo' }); };
    var match = function(e) { dispatchEvent({ type: 'match', a: $(e.target).attr('data-a'), b: $(e.target).attr('data-b') }); };

    return {
        load: load,
        setMasterDiv: setMasterDiv,
        setShowList: setShowList,
        setIdProperty: setIdProperty,
        addEvent: addEvent,
        next: next,
        prev: prev,
        undo: undo,
        match: match
    };
}));