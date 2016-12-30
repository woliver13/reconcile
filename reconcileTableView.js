(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root.reconcileTableView = factory(root.$);
    }
}(this, function ($) {
    var masterDiv = null;
    var showList = false;
    var idProperty = 'id';

    var setMasterDiv = function (div) { masterDiv = div; };
    var setShowList = function (showList1) { showList = showList1; };
    var setIdProperty = function (prop) { idProperty = prop; };

    var buildMatchLine = function (matchItem) {
        var matchDiv = $('<tr>');
        for (var key in matchItem) {
            if (key != idProperty) {
                var cellDiv = $('<td>' + matchItem[key] + '</td>');
                matchDiv.append(cellDiv);
            }
        }
        matchDiv.append($('<td><button class="btn" onclick="reconcile.next(); return false;" accesskey="n">Next</button></td>'));
        matchDiv.append($('<td><button class="btn" onclick="reconcile.prev(); return false;"accesskey="p">Prev</button></td>'));
        matchDiv.append($('<td><button class="btn" onclick="reconcile.undo(); return false;"accesskey="u">Undo</button></td>'));
        return matchDiv;
    };

    var buildHeaderDiv = function (matchItem) {
        var headerDiv = $('<tr style="background-color:#000;color:#fff">');
        for (var key in matchItem) {
            if (key != idProperty) {
                var cellDiv = $('<td>' + key + '</div>');
                headerDiv.append(cellDiv);
            }
        }
        return headerDiv;
    };

    var buildCandidates = function (matchItem, candidates) {
        var result = candidates.map(function (item) {
            var candidateDiv = $('<tr>');
            for (var key in item) {
                if (key != idProperty && key != 'weights') {
                    var cellDiv = $('<td>' + item[key] + '</td>');
                    if (item.weights[key] == 100) cellDiv.addClass('match-same');
                    if (item.weights[key] == 80) cellDiv.addClass('match-samews');
                    if (item.weights[key] == 30) cellDiv.addClass('match-contains');
                    candidateDiv.append(cellDiv);
                }
            }
            candidateDiv.append($('<td><button class="btn" onclick="reconcile.match(&quot;' + matchItem[idProperty] + '&quot;,&quot;' + item[idProperty] + '&quot); return false;"accesskey="m">Match</button></td>'));
            return candidateDiv;
        });
        return result;
    };

    var buildList = function (list, listName) {
        var listId = listName.replace(' ', '_');
        var result = $('<div id="' + listId + '"><h3>' + listName + '</h3></div>');
        var table = $('<table>');
        $.each(list, function (index, item) {
            var rowDiv = $('<tr>');
            for (var key in item) {
                if (key != idProperty)
                    rowDiv.append($('<td>' + item[key] + '</td>'));
            }
            table.append(rowDiv);
        });
        result.append(table);
        return result;
    };

    var load = function (matchItem, candidates, listA, listB) {
        masterDiv.empty();
        if (listA.length > 0) {
            var tableDiv = $('<table>');
            tableDiv.append(buildMatchLine(matchItem));
            tableDiv.append(buildHeaderDiv(matchItem));
            $.each(buildCandidates(matchItem, candidates), function(index, item) {
                tableDiv.append(item);
            });
            masterDiv.append(tableDiv);
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