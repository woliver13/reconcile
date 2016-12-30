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
    var setIdProperty = function (prop) { idProperty = prop; };

    var buildMatchLine = function(matchItem) {
        var matchDiv = $('<div class="row">');
        for (var key in matchItem) {
            if (key != idProperty) {
                var cellDiv = $('<div class="col-md-1">' + matchItem[key] + '</div>');
                matchDiv.append(cellDiv);
            }
        }
        matchDiv.append($('<div class="col-md-1"><button class="btn" onclick="reconcile.next(); return false;" accesskey="n">Next</button></div>'));
        matchDiv.append($('<div class="col-md-1"><button class="btn" onclick="reconcile.prev(); return false;"accesskey="p">Prev</button></div>'));
        matchDiv.append($('<div class="col-md-1"><button class="btn" onclick="reconcile.undo(); return false;"accesskey="u">Undo</button></div>'));
        return matchDiv;
    };

    var buildHeaderDiv = function(matchItem) {
        var headerDiv = $('<div class="row" style="background-color:#f0f0f0">');
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
            candidateDiv.append($('<div class="col-md-1"><button class="btn" onclick="reconcile.match(&quot;' + matchItem[idProperty] + '&quot;,&quot;' + item[idProperty] + '&quot); return false;"accesskey="m">Match</button></div>'));
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

    var load = function(matchItem, candidates, listA, listB) {
        masterDiv.empty();
        if (listA.length > 0) {
            masterDiv.append(buildMatchLine(matchItem));
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
    
    return {
        load: load,
        setMasterDiv: setMasterDiv,
        setShowList: setShowList,
        setIdProperty: setIdProperty
    };
}));