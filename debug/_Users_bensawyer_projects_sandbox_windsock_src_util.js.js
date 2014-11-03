
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_NgbAzE, __expression_xV3rAh, __block_QS1CCl;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_NgbAzE = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/util.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_xV3rAh = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/util.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_QS1CCl = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/util.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_ARVAX8 = function(id, obj) {
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
    __extro_yFhyvT = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/util.js');
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
    __statement_NgbAzE(0);
    var tick = (__expression_xV3rAh(3), (__expression_xV3rAh(4), (__expression_xV3rAh(5), typeof process) !== 'undefined') && process.nextTick) ? (__expression_xV3rAh(1), process.nextTick) : (__expression_xV3rAh(2), window.setTimeout);
}
{
    __statement_NgbAzE(6);
    var Util = {
            nextTick: function (fn) {
                __block_QS1CCl(0);
                {
                    __statement_NgbAzE(7);
                    __expression_xV3rAh(8), tick(fn, 1);
                }
            },
            each: function (obj, fn) {
                __block_QS1CCl(1);
                {
                    __statement_NgbAzE(9);
                    var halt = __extro_yFhyvT(10, __intro_ARVAX8(10, Object).create(null)), keys;
                }
                if (__expression_xV3rAh(11), !obj.length) {
                    __block_QS1CCl(2);
                    {
                        __statement_NgbAzE(12);
                        keys = __extro_yFhyvT(13, __intro_ARVAX8(13, Object).keys(obj));
                    }
                    for (var i = 0, l = keys.length; __expression_xV3rAh(14), (__expression_xV3rAh(15), i) < (__expression_xV3rAh(16), l); __expression_xV3rAh(17), i++) {
                        __block_QS1CCl(3);
                        if (__expression_xV3rAh(18), __extro_yFhyvT(19, __intro_ARVAX8(19, fn).call(this, obj[keys[i]], keys[i], obj, halt)) === (__expression_xV3rAh(20), halt)) {
                            __block_QS1CCl(4);
                            return __expression_xV3rAh(21);
                        }
                    }
                    return __expression_xV3rAh(22);
                }
                for (var i = 0, l = obj.length; __expression_xV3rAh(23), (__expression_xV3rAh(24), i) < (__expression_xV3rAh(25), l); __expression_xV3rAh(26), i++) {
                    __block_QS1CCl(5);
                    if (__expression_xV3rAh(27), __extro_yFhyvT(28, __intro_ARVAX8(28, fn).call(this, obj[i], i, obj, halt)) === (__expression_xV3rAh(29), halt)) {
                        __block_QS1CCl(6);
                        return __expression_xV3rAh(30);
                    }
                }
            },
            traverse: function (list, fn) {
                __block_QS1CCl(7);
                {
                    __statement_NgbAzE(31);
                    __extro_yFhyvT(32, __intro_ARVAX8(32, Util.each).call(this, list, function (result) {
                        __block_QS1CCl(8);
                        {
                            __statement_NgbAzE(33);
                            var halt;
                        }
                        {
                            __statement_NgbAzE(34);
                            halt = __extro_yFhyvT(35, __intro_ARVAX8(35, fn).apply(this, __extro_yFhyvT(36, __intro_ARVAX8(36, Array.prototype.slice).call(arguments))));
                        }
                        if (__expression_xV3rAh(37), __extro_yFhyvT(38, __intro_ARVAX8(38, Util).is(result, 'object')) || __extro_yFhyvT(39, __intro_ARVAX8(39, Util).is(result, 'array'))) {
                            __block_QS1CCl(9);
                            {
                                __statement_NgbAzE(40);
                                __extro_yFhyvT(41, __intro_ARVAX8(41, Util.traverse).call(this, result, fn));
                            }
                        }
                        return __expression_xV3rAh(42), halt;
                    }));
                }
            },
            extend: function (obj) {
                __block_QS1CCl(10);
                for (var i = 1, l = arguments.length; __expression_xV3rAh(43), (__expression_xV3rAh(44), i) < (__expression_xV3rAh(45), l); __expression_xV3rAh(46), i++) {
                    __block_QS1CCl(11);
                    {
                        __statement_NgbAzE(47);
                        __extro_yFhyvT(48, __intro_ARVAX8(48, Util).each(arguments[i], function (value, key) {
                            __block_QS1CCl(12);
                            {
                                __statement_NgbAzE(49);
                                obj[key] = value;
                            }
                        }));
                    }
                }
                return __expression_xV3rAh(50), obj;
            },
            inherit: function (construct, superConstruct, props) {
                __block_QS1CCl(13);
                if (__expression_xV3rAh(51), construct.prototype && superConstruct.prototype) {
                    __block_QS1CCl(14);
                    {
                        __statement_NgbAzE(52);
                        construct.prototype = __extro_yFhyvT(53, __intro_ARVAX8(53, Object).create(superConstruct.prototype, props));
                    }
                    {
                        __statement_NgbAzE(54);
                        construct.prototype.constructor = construct;
                    }
                }
                return __expression_xV3rAh(55), construct;
            },
            match: function (list, query) {
                __block_QS1CCl(15);
                {
                    __statement_NgbAzE(56);
                    var matched = true;
                }
                {
                    __statement_NgbAzE(57);
                    __extro_yFhyvT(58, __intro_ARVAX8(58, Util).each(query, function (val, key) {
                        __block_QS1CCl(16);
                        if (__expression_xV3rAh(59), list[key] !== (__expression_xV3rAh(60), val)) {
                            __block_QS1CCl(17);
                            {
                                __statement_NgbAzE(61);
                                matched = false;
                            }
                        }
                    }));
                }
                return __expression_xV3rAh(62), matched;
            },
            bind: function (fn, context) {
                __block_QS1CCl(18);
                return __expression_xV3rAh(63), function () {
                    __block_QS1CCl(19);
                    return __expression_xV3rAh(64), __extro_yFhyvT(65, __intro_ARVAX8(65, fn).apply(context, __extro_yFhyvT(66, __intro_ARVAX8(66, Array.prototype.slice).call(arguments))));
                };
            },
            is: function (obj, type) {
                __block_QS1CCl(20);
                return __expression_xV3rAh(67), (__expression_xV3rAh(68), __extro_yFhyvT(69, __intro_ARVAX8(69, Object.prototype.toString).call(obj)) === (__expression_xV3rAh(70), (__expression_xV3rAh(71), '[object ' + __extro_yFhyvT(72, __intro_ARVAX8(72, Util).upperCase(type))) + ']'));
            },
            upperCase: function (str) {
                __block_QS1CCl(21);
                return __expression_xV3rAh(73), __extro_yFhyvT(74, __intro_ARVAX8(74, str).replace(/[a-z]/, function (match) {
                    __block_QS1CCl(22);
                    return __expression_xV3rAh(75), __extro_yFhyvT(76, __intro_ARVAX8(76, match).toUpperCase());
                }));
            },
            isEmpty: function (obj) {
                __block_QS1CCl(23);
                return __expression_xV3rAh(77), (__expression_xV3rAh(78), __extro_yFhyvT(79, __intro_ARVAX8(79, Object).keys(obj)).length == false);
            },
            noop: function () {
                __block_QS1CCl(24);
            }
        };
}
{
    __statement_NgbAzE(80);
    module.exports = Util;
}