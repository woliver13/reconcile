// Minimal synchronous jQuery stub for Jest — only covers Deferred/promise used by reconcileTestService.
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

module.exports = $;
