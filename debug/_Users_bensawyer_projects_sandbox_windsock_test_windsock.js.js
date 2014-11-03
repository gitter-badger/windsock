
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_BxKaoE, __expression_m9LXnr, __block_fXc7yB;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_BxKaoE = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/windsock.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_m9LXnr = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/windsock.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_fXc7yB = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/windsock.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_o2TnOj = function(id, obj) {
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
    __extro_BQXsB3 = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/windsock.js');
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
    __statement_BxKaoE(0);
    var Windsock = (__expression_m9LXnr(1), require('../src/windsock'));
}
{
    __statement_BxKaoE(2);
    var assert = (__expression_m9LXnr(3), require('assert'));
}
{
    __statement_BxKaoE(4);
    __expression_m9LXnr(5), describe('Windsock', function () {
        __block_fXc7yB(0);
        {
            __statement_BxKaoE(6);
            __expression_m9LXnr(7), it('should be loaded successfully', function () {
                __block_fXc7yB(1);
                {
                    __statement_BxKaoE(8);
                    __extro_BQXsB3(9, __intro_o2TnOj(9, assert).notStrictEqual((__expression_m9LXnr(10), typeof Windsock), 'undefined'));
                }
            });
        }
        {
            __statement_BxKaoE(11);
            __expression_m9LXnr(12), it('should do this', function () {
                __block_fXc7yB(2);
                {
                    __statement_BxKaoE(13);
                    var windsock = new Windsock({
                            markup: '<p>some text</p>',
                            data: {
                                other: 'text'
                            }
                        });
                }
            });
        }
    });
}