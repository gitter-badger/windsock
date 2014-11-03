
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_OCEmD5, __expression_nk7GgO, __block_lZoVT2;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_OCEmD5 = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/windsock.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_nk7GgO = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/windsock.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_lZoVT2 = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/windsock.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_UbUcBk = function(id, obj) {
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
    __extro_QTyYkY = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/windsock.js');
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
    __statement_OCEmD5(0);
    'use strict';
}
{
    __statement_OCEmD5(1);
    var util = (__expression_nk7GgO(2), require('./util')), Parser = (__expression_nk7GgO(3), require('./parser')), Observer = (__expression_nk7GgO(4), require('./observer')), inherit = util.inherit, extend = util.extend, each = util.each, is = util.is;
}
{
    __statement_OCEmD5(5);
    var builder = {
            html: {
                start: function () {
                    __block_lZoVT2(0);
                }
            }
        };
}
{
    __statement_OCEmD5(6);
    var parser = new Parser();
}
{
    __statement_OCEmD5(7);
    __expression_nk7GgO(8), each(Parser.signals, function (signal) {
        __block_lZoVT2(1);
        {
            __statement_OCEmD5(9);
            __extro_QTyYkY(10, __intro_UbUcBk(10, parser[signal]).add());
        }
    });
}
function Windsock(options) {
    __block_lZoVT2(2);
    {
        __statement_OCEmD5(11);
        this.data = __extro_QTyYkY(12, __intro_UbUcBk(12, Observer).observe(options.data));
    }
}
{
    __statement_OCEmD5(13);
    Windsock.prototype = {};
}
{
    __statement_OCEmD5(14);
    module.exports = Windsock;
}