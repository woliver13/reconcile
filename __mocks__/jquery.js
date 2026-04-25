// Minimal synchronous jQuery stub for Jest — covers Deferred/promise and $.when.
const $ = function() {};

$.Deferred = function() {
    let _value;
    const promise = {
        done: function(cb) { cb(_value); return promise; },
        then: function(cb) { cb(_value); return promise; }
    };
    return {
        resolve: function(val) { _value = val; },
        promise: function() { return promise; }
    };
};

$.when = function(promise) {
    let _resolved;
    promise.done(function(val) { _resolved = val; });
    return {
        then: function(success, _error) {
            if (success) success(_resolved);
        }
    };
};

module.exports = $;
