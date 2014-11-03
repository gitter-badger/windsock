
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_LN5ivy, __expression_VMiHiu, __block_pQV0b$;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_LN5ivy = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/observer.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_VMiHiu = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/observer.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_pQV0b$ = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/observer.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro__mME7M = function(id, obj) {
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
    __extro_ZSoO2P = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/observer.js');
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
    __statement_LN5ivy(0);
    var util = (__expression_VMiHiu(1), require('./util')), Signals = (__expression_VMiHiu(2), require('./signals')), is = util.is, bind = util.bind, each = util.each, extend = util.extend;
}
function accessors(value, obj) {
    __block_pQV0b$(0);
    return __expression_VMiHiu(3), {
        get: function () {
            __block_pQV0b$(1);
            return __expression_VMiHiu(4), value;
        },
        set: function (val) {
            __block_pQV0b$(2);
            if (__expression_VMiHiu(5), (__expression_VMiHiu(6), is(val, 'array')) || (__expression_VMiHiu(7), is(val, 'object'))) {
                __block_pQV0b$(3);
                {
                    __statement_LN5ivy(8);
                    val = __extro_ZSoO2P(9, __intro__mME7M(9, Observer).observe(val));
                }
            }
            {
                __statement_LN5ivy(10);
                value = val;
            }
            {
                __statement_LN5ivy(11);
                __extro_ZSoO2P(12, __intro__mME7M(12, obj._observers).dispatch((__expression_VMiHiu(13), mutation({
                    method: 'set',
                    value: value
                }))));
            }
        },
        enumerable: true
    };
}
function mutation(obj) {
    __block_pQV0b$(4);
    return __expression_VMiHiu(14), (__expression_VMiHiu(15), extend(__extro_ZSoO2P(16, __intro__mME7M(16, Object).create(null, {
        method: {
            value: null,
            writable: true,
            enumerable: true
        },
        value: {
            value: null,
            writable: true,
            enumerable: true
        }
    })), obj));
}
function Observer() {
    __block_pQV0b$(5);
}
{
    __statement_LN5ivy(17);
    Observer.prototype = {};
}
{
    __statement_LN5ivy(18);
    Observer.observable = function (obj) {
        __block_pQV0b$(6);
        {
            __statement_LN5ivy(19);
            __extro_ZSoO2P(20, __intro__mME7M(20, Object).defineProperties(obj, {
                add: {
                    value: (__expression_VMiHiu(21), bind(function (key, value) {
                        __block_pQV0b$(7);
                        {
                            __statement_LN5ivy(22);
                            value = (__expression_VMiHiu(23), (__expression_VMiHiu(24), value) || (__expression_VMiHiu(25), key));
                        }
                        if (__expression_VMiHiu(26), (__expression_VMiHiu(27), is(value, 'array')) || (__expression_VMiHiu(28), is(value, 'object'))) {
                            __block_pQV0b$(8);
                            {
                                __statement_LN5ivy(29);
                                value = __extro_ZSoO2P(30, __intro__mME7M(30, Observer).observe(value));
                            }
                        }
                        if (__expression_VMiHiu(31), is(this, 'array')) {
                            __block_pQV0b$(9);
                            {
                                __statement_LN5ivy(32);
                                __extro_ZSoO2P(33, __intro__mME7M(33, Object).defineProperty(this, (__expression_VMiHiu(34), this.length - 1), (__expression_VMiHiu(35), accessors(value, this))));
                            }
                            {
                                __statement_LN5ivy(36);
                                __extro_ZSoO2P(37, __intro__mME7M(37, this).push(value));
                            }
                        } else {
                            __block_pQV0b$(10);
                            {
                                __statement_LN5ivy(38);
                                __extro_ZSoO2P(39, __intro__mME7M(39, Object).defineProperty(this, key, (__expression_VMiHiu(40), accessors(value, this))));
                            }
                        }
                        {
                            __statement_LN5ivy(41);
                            __extro_ZSoO2P(42, __intro__mME7M(42, this._observers).dispatch((__expression_VMiHiu(43), mutation({
                                method: 'add',
                                value: value
                            }))));
                        }
                    }, obj)),
                    enumerable: false
                },
                remove: {
                    value: (__expression_VMiHiu(44), bind(function (key) {
                        __block_pQV0b$(11);
                        {
                            __statement_LN5ivy(45);
                            var removed;
                        }
                        if (__expression_VMiHiu(46), (__expression_VMiHiu(47), typeof this[key]) !== 'undefined') {
                            __block_pQV0b$(12);
                            {
                                __statement_LN5ivy(48);
                                removed = this[key];
                            }
                            if (__expression_VMiHiu(49), is(this, 'array')) {
                                __block_pQV0b$(13);
                                {
                                    __statement_LN5ivy(50);
                                    __extro_ZSoO2P(51, __intro__mME7M(51, this).splice(key, 1));
                                }
                            } else {
                                __block_pQV0b$(14);
                                {
                                    __statement_LN5ivy(52);
                                    __expression_VMiHiu(53), delete this[key];
                                }
                            }
                            {
                                __statement_LN5ivy(54);
                                __extro_ZSoO2P(55, __intro__mME7M(55, this._observers).dispatch((__expression_VMiHiu(56), mutation({
                                    method: 'remove',
                                    value: value
                                }))));
                            }
                        }
                    }, obj)),
                    enumerable: false
                },
                _observers: {
                    value: new Signals(),
                    enumerable: false
                }
            }));
        }
        return __expression_VMiHiu(57), obj;
    };
}
{
    __statement_LN5ivy(58);
    Observer.observe = function (obj) {
        __block_pQV0b$(15);
        {
            __statement_LN5ivy(59);
            var object;
        }
        if (__expression_VMiHiu(60), is(obj, 'object')) {
            __block_pQV0b$(16);
            {
                __statement_LN5ivy(61);
                object = __extro_ZSoO2P(62, __intro__mME7M(62, Observer).observable(__extro_ZSoO2P(63, __intro__mME7M(63, Object).create(Object.prototype))));
            }
        } else if (__expression_VMiHiu(64), is(obj, 'array')) {
            __block_pQV0b$(17);
            {
                __statement_LN5ivy(65);
                object = __extro_ZSoO2P(66, __intro__mME7M(66, Observer).observable(__extro_ZSoO2P(67, __intro__mME7M(67, Object).create(Array.prototype))));
            }
        } else {
            __block_pQV0b$(18);
            {
                __statement_LN5ivy(68);
                throw new Error('param is not of type Object or Array');
            }
        }
        {
            __statement_LN5ivy(69);
            __expression_VMiHiu(70), each(obj, function (value, key) {
                __block_pQV0b$(19);
                {
                    __statement_LN5ivy(71);
                    __extro_ZSoO2P(72, __intro__mME7M(72, object).add(key, value));
                }
            });
        }
        return __expression_VMiHiu(73), object;
    };
}
{
    __statement_LN5ivy(74);
    module.exports = Observer;
}