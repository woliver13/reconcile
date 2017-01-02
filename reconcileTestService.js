(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root.reconcileTestService = factory(root.$);
    }
}(this, function($) {
    // last a and b would most likely come from web service calls.
    var listA = [
        { FirstName: 'Nick', LastName: 'Sarkosy', DL: '123456789', DOB: new Date(1966, 6, 6), PKey: 5, SSN: null },
        { FirstName: 'Dale', LastName: 'Earnhardt', DL: '123456780', DOB: new Date(1935, 1, 12), PKey: 4, SSN: '123456789' },
        { FirstName: 'Oliver', LastName: 'Clark', DL: '123456782', DOB: new Date(1966, 6, 6), PKey: 3, SSN: '123456123' }
    ];

    var listB = [
        { id: 'A', name: { last: 'Zarkosi', first: 'Nicholas' }, drivers: '123456789', dateOfBirth: '19660606' },
        { id: 'B', name: { last: 'Earnhardt Sr', first: 'Dale' }, drivers: '123456780', dateOfBirth: '19350112' },
        { id: 'C', name: { last: 'Earnhardt Jr', first: 'Dale' }, drivers: '123456781', dateOfBirth: '19660606' },
        { id: 'D', name: { last: 'Oliver', first: 'Clark' }, drivers: '123456782', dateOfBirth: '19660606' }
    ];

    var makeAStandard = function(item) {
        var result = new Object();
        result.id = item.PKey.toString();
        result.firstName = item.FirstName;
        result.lastName = item.LastName;
        result.gid = item.DL;
        result.dateOfBirth = item.DOB.getFullYear().toString() + ('0' + item.DOB.getMonth()).slice(-2) + ('0' + item.DOB.getDate()).slice(-2);
        result.ssn = item.SSN;
        return result;
    };

    var makeBStandard = function(item) {
        var result = new Object();
        result.id = item.id;
        result.firstName = item.name.first;
        result.lastName = item.name.last;
        result.gid = item.drivers;
        result.dateOfBirth = item.dateOfBirth;
        result.ssn = null;
        return result;
    };

    var set = function (listAId, listBId) {
        alert('matching ' + listAId + ' => ' + listBId);
        /* let systems know of match */
        // $.postJSON('/api/matches',{sysa:listAId,sysb:listBId});
    };
    var undo = function (listAId, listBId) {
        alert('undoing ' + listAId + ' => ' + listBId);
        /* let systems know that this match is bogus */
        /*
        $.ajax({
          url:'/api/matches',
          method:'DELETE',
          data:{sysa:listAId,sysb:listBId}
        });
        */
    };
    var load = function() {
        var dfd = $.Deferred();
        /*
        $.ajax({url:'/api/unmatched',datatype:'JSON',method:'GET'})
          .complete(function(data){
            return { a: data.a.map(makeAStandard), b: data.b.map(makeBStandard)};
          });
        */
        var result = {
            a: listA.map(makeAStandard),
            b: listB.map(makeBStandard)
        };

        dfd.resolve(result);
        return dfd.promise();
    };

    return {
        load: load,
        set: set,
        undo: undo
    };
}));