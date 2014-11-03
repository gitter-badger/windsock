
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_hD5Dxk, __expression_bF7sVA, __block_vGRpoA;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_hD5Dxk = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/signals.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_bF7sVA = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/signals.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_vGRpoA = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/signals.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_d2QhQk = function(id, obj) {
        // console.log('__intro: ', id, ', obj.__instrumented_miss: ', obj.__instrumented_miss, ', obj.length: ', obj.length);
        (typeof obj === 'object' || typeof obj === 'function') &&
            Object.defineProperty && Object.defineProperty(obj, '__instrumented_miss', {enumerable: false, writable: true});
        obj.__instrumented_miss = obj.__instrumented_miss || [];
        if ('undefined' !== typeof obj && null !== obj && 'undefined' !== typeof obj.__instrumented_miss) {
            if (obj.length === 0) {
                // console.log('interim miss: ', id);
                obj.__instrumented_miss[id] = true;
            } else {
                obj.__instrumented_miss[id] = false;
            }
        }
        return obj;
    };
    function isProbablyChainable(obj, id) {
        return obj &&
            obj.__instrumented_miss[id] !== undefined &&
            'number' === typeof obj.length;
    }
    __extro_ZQYmuT = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/signals.js');
        // console.log('__extro: ', id, ', obj.__instrumented_miss: ', obj.__instrumented_miss, ', obj.length: ', obj.length);
        if ('undefined' !== typeof obj && null !== obj && 'undefined' !== typeof obj.__instrumented_miss) {
            if (isProbablyChainable(obj, id) && obj.length === 0 && obj.__instrumented_miss[id]) {
                // if the call was not a "constructor" - i.e. it did not add things to the chainable
                // and it did not return anything from the chainable, it is a miss
                // console.log('miss: ', id);
            } else {
                fs.writeSync(fd, '{"chain": {"node": ' + id + '}},\n');
            }
            obj.__instrumented_miss[id] = undefined;
        } else {
            fs.writeSync(fd, '{"chain": {"node": ' + id + '}},\n');
        }
        return obj;
    };
};
////////////////////////

// Instrumented Code
{
    __statement_hD5Dxk(0);
    var util = (__expression_bF7sVA(1), require('./util.js')), each = util.each;
}
function Signal(fn, context, priority) {
    __block_vGRpoA(0);
    {
        __statement_hD5Dxk(2);
        this.binding = fn;
    }
    {
        __statement_hD5Dxk(3);
        this.context = context;
    }
    {
        __statement_hD5Dxk(4);
        this.priority = (__expression_bF7sVA(7), (__expression_bF7sVA(8), typeof priority) !== 'undefined') ? (__expression_bF7sVA(5), priority) : (__expression_bF7sVA(6), 0);
    }
}
{
    __statement_hD5Dxk(9);
    Signal.prototype = {
        invoke: function (args) {
            __block_vGRpoA(1);
            if (this.binding) {
                __block_vGRpoA(2);
                return __expression_bF7sVA(10), __extro_ZQYmuT(11, __intro_d2QhQk(11, this.binding).apply(this.context, args));
            }
        }
    };
}
function Signals() {
    __block_vGRpoA(3);
    {
        __statement_hD5Dxk(12);
        this._signals = [];
    }
}
{
    __statement_hD5Dxk(13);
    Signals.prototype = {
        dispatch: function () {
            __block_vGRpoA(4);
            {
                __statement_hD5Dxk(14);
                var args = __extro_ZQYmuT(15, __intro_d2QhQk(15, Array.prototype.slice).call(arguments));
            }
            {
                __statement_hD5Dxk(16);
                __expression_bF7sVA(17), each(this._signals, function (signal) {
                    __block_vGRpoA(5);
                    if (__expression_bF7sVA(18), __extro_ZQYmuT(19, __intro_d2QhQk(19, signal).invoke(args)) === false) {
                        __block_vGRpoA(6);
                        return __expression_bF7sVA(20), arguments[3];
                    }
                });
            }
        },
        add: function (fn, context, priority) {
            __block_vGRpoA(7);
            {
                __statement_hD5Dxk(21);
                var signal = new Signal(fn, context, priority), i = 0;
            }
            while (__expression_bF7sVA(22), (__expression_bF7sVA(23), i) < this._signals.length) {
                __block_vGRpoA(8);
                if (__expression_bF7sVA(24), signal.priority <= this._signals[i].priority) {
                    __block_vGRpoA(9);
                    break;
                }
                {
                    __statement_hD5Dxk(25);
                    __expression_bF7sVA(26), i++;
                }
            }
            {
                __statement_hD5Dxk(27);
                __extro_ZQYmuT(28, __intro_d2QhQk(28, this._signals).splice(i, 0, signal));
            }
            return __expression_bF7sVA(29), signal;
        },
        remove: function (signal) {
            __block_vGRpoA(10);
            {
                __statement_hD5Dxk(30);
                var i = __extro_ZQYmuT(31, __intro_d2QhQk(31, this._signals).indexOf(signal));
            }
            if (__expression_bF7sVA(32), (__expression_bF7sVA(33), i) !== (__expression_bF7sVA(34), -1)) {
                __block_vGRpoA(11);
                {
                    __statement_hD5Dxk(35);
                    __extro_ZQYmuT(36, __intro_d2QhQk(36, this._signals).splice(i, 1));
                }
            }
            return __expression_bF7sVA(37), i;
        }
    };
}
{
    __statement_hD5Dxk(38);
    Signals.signal = Signal;
}
{
    __statement_hD5Dxk(39);
    module.exports = Signals;
}