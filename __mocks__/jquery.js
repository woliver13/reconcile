// Minimal synchronous jQuery stub for Jest — covers Deferred/promise, $.when, $.each,
// and chainable DOM-building stubs. $ is a jest.fn() so tests can inspect $.mock.calls.
const makeEl = () => {
    const el = {
        empty: () => el,
        append: () => el,
        addClass: () => el,
        on: () => el,
        find: () => el,
        prop: () => el,
        focus: () => el,
        first: () => el,
        attr: () => '',
    };
    return el;
};

const $ = jest.fn(() => makeEl());

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

$.each = function(arr, fn) {
    arr.forEach(function(item, i) { fn(i, item); });
};

module.exports = $;
