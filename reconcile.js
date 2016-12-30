(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root.reconcile = factory(root.$);
    }
}(this, function($) {
    var position = 0;
    var listA = [];
    var listB = [];
    var memento = [];
    var service = null;
    var view = null;
    var idProperty = 'id';

    var setService = function(service1) { service = service1; };
    var setView = function(view1) { view = view1; };
    var setIdProperty = function (prop) {
        idProperty = prop;
        view.setIdProperty(prop);
    };

    var next = function() {
        position++;
        if (position >= listA.length) position = 0;
        redraw();
    };

    var prev = function() {
        position--;
        if (position < 0) position = listA.length - 1;
        redraw();
    };

    var redraw = function() {
        var matchItem = listA[position];
        view.load(matchItem, getCandidates(matchItem, listB), listA, listB);
    };

    var load = function() {
        $.when(service.load()).then(function(data) {
            listA = data.a;
            listB = data.b;
            redraw();
        }, function(status) {
            view.showError(status);
        });
    };

    var sortByMatchTotal = function(obj1, obj2) {
        if (obj1.weights['matchTotal'] > obj2.weights['matchTotal']) return -1;
        if (obj1.weights['matchTotal'] < obj2.weights['matchTotal']) return 1;
        return 0;
    };

    var getCandidates = function (matchItem, list) {
        if (matchItem == null) return [];
        var result = list.map(function(item) {
            var result2 = new Object();
            var weights = new Object();
            var matchTotal = 0;
            for (var key in item) {
                result2[key] = item[key];
                if (key != idProperty) {
                    weights[key] = getWeight(item[key], matchItem[key]);
                    matchTotal += weights[key];
                }
            };
            weights['matchTotal'] = matchTotal;
            result2.weights = weights;
            return result2;
        });
        return result.filter(function(item) { return item.weights['matchTotal'] > 0; }).sort(sortByMatchTotal);
    };

    var getWeight = function(cell1, cell2) {
        if (cell1 == null) return 0;
        if (cell2 == null) return 0;
        if (cell1 == cell2) return 100;
        if (isSameWs(cell1, cell2)) return 80;
        if (doesContain(cell1, cell2)) return 30;
        return 0;
    };
    var isSameWs = function(cell1, cell2) {
        if (cell1 == null) return false;
        if (cell2 == null) return false;
        return cell1.toString().toUpperCase().replace(/\s/g, '') == cell2.toString().toUpperCase().replace(/\s/g, '');
    };
    var doesContain = function(cell1, cell2) {
        if (cell1 == null) return false;
        if (cell2 == null) return false;
        if (cell1.toString().toUpperCase().indexOf(cell2.toString().toUpperCase()) > -1) return true;
        if (cell2.toString().toUpperCase().indexOf(cell1.toString().toUpperCase()) > -1) return true;
        return false;
    };
    var match = function(listAId, listBId) {
        service.set(listAId, listBId);
        var lastMatch = {
            a: listA.find(function(item) { return item[idProperty] == listAId; }),
            b: listB.find(function(item) { return item[idProperty] == listBId; })
        };
        memento.push(lastMatch);
        listA = listA.filter(function(item) { return item[idProperty] != listAId; });
        listB = listB.filter(function(item) { return item[idProperty] != listBId; });
        redraw();
    };

    var undo = function() {
        if (memento.length == 0) return;
        var lastMatch = memento.pop();
        listA.push(lastMatch.a);
        listB.push(lastMatch.b);
        redraw();
    };

    
    return {
        next: next,
        prev: prev,
        match: match,
        undo: undo,
        load: load,
        setService: setService,
        setView: setView,
        setIdProperty: setIdProperty
    };
}));