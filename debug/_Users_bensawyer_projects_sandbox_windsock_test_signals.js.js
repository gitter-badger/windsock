
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_gyZq0b, __expression_eg06U4, __block_nbIHVN;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_gyZq0b = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/signals.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_eg06U4 = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/signals.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_nbIHVN = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/signals.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_cy6A3d = function(id, obj) {
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
    __extro_QPcEYf = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/signals.js');
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
    __statement_gyZq0b(0);
    var Signals = (__expression_eg06U4(1), require('../src/signals'));
}
{
    __statement_gyZq0b(2);
    var assert = (__expression_eg06U4(3), require('assert'));
}
{
    __statement_gyZq0b(4);
    __expression_eg06U4(5), describe('Signals', function () {
        __block_nbIHVN(0);
        {
            __statement_gyZq0b(6);
            __expression_eg06U4(7), it('should be loaded successfully', function () {
                __block_nbIHVN(1);
                {
                    __statement_gyZq0b(8);
                    __extro_QPcEYf(9, __intro_cy6A3d(9, assert).notStrictEqual((__expression_eg06U4(10), typeof Signals), 'undefined'));
                }
            });
        }
        {
            __statement_gyZq0b(11);
            __expression_eg06U4(12), describe('Signals.signal', function () {
                __block_nbIHVN(2);
                {
                    __statement_gyZq0b(13);
                    __expression_eg06U4(14), it('should be an instance of Signal', function () {
                        __block_nbIHVN(3);
                        {
                            __statement_gyZq0b(15);
                            var signal = new Signals.signal();
                        }
                        {
                            __statement_gyZq0b(16);
                            __extro_QPcEYf(17, __intro_cy6A3d(17, assert).strictEqual((__expression_eg06U4(18), (__expression_eg06U4(19), signal) instanceof Signals.signal), true));
                        }
                    });
                }
            });
        }
        {
            __statement_gyZq0b(20);
            __expression_eg06U4(21), describe('add(fn)', function () {
                __block_nbIHVN(4);
                {
                    __statement_gyZq0b(22);
                    var signals = new Signals();
                }
                {
                    __statement_gyZq0b(23);
                    __expression_eg06U4(24), it('should add signal', function () {
                        __block_nbIHVN(5);
                        {
                            __statement_gyZq0b(25);
                            var signal = __extro_QPcEYf(26, __intro_cy6A3d(26, signals).add(function () {
                                    __block_nbIHVN(6);
                                }));
                        }
                        {
                            __statement_gyZq0b(27);
                            __extro_QPcEYf(28, __intro_cy6A3d(28, assert).strictEqual((__expression_eg06U4(29), (__expression_eg06U4(30), signal) instanceof Signals.signal), true));
                        }
                        {
                            __statement_gyZq0b(31);
                            __extro_QPcEYf(32, __intro_cy6A3d(32, assert).strictEqual(signals._signals.length, 1));
                        }
                    });
                }
                {
                    __statement_gyZq0b(33);
                    __expression_eg06U4(34), it('should add signal with correct context', function () {
                        __block_nbIHVN(7);
                        {
                            __statement_gyZq0b(35);
                            var context = __extro_QPcEYf(36, __intro_cy6A3d(36, Object).create(null));
                        }
                        {
                            __statement_gyZq0b(37);
                            var signal = __extro_QPcEYf(38, __intro_cy6A3d(38, signals).add(function () {
                                    __block_nbIHVN(8);
                                }, context));
                        }
                        {
                            __statement_gyZq0b(39);
                            __extro_QPcEYf(40, __intro_cy6A3d(40, assert).strictEqual(signal.context, context));
                        }
                    });
                }
                {
                    __statement_gyZq0b(41);
                    __expression_eg06U4(42), it('should add signal with correct priority', function () {
                        __block_nbIHVN(9);
                        {
                            __statement_gyZq0b(43);
                            var signal = __extro_QPcEYf(44, __intro_cy6A3d(44, signals).add(function () {
                                    __block_nbIHVN(10);
                                }, undefined, 3));
                        }
                        {
                            __statement_gyZq0b(45);
                            __extro_QPcEYf(46, __intro_cy6A3d(46, assert).strictEqual(signal.priority, 3));
                        }
                    });
                }
            });
        }
        {
            __statement_gyZq0b(47);
            __expression_eg06U4(48), describe('remove(signal)', function () {
                __block_nbIHVN(11);
                {
                    __statement_gyZq0b(49);
                    var signals = new Signals();
                }
                {
                    __statement_gyZq0b(50);
                    __expression_eg06U4(51), it('should remove signal', function () {
                        __block_nbIHVN(12);
                        {
                            __statement_gyZq0b(52);
                            var signal = __extro_QPcEYf(53, __intro_cy6A3d(53, signals).add(function () {
                                    __block_nbIHVN(13);
                                }));
                        }
                        {
                            __statement_gyZq0b(54);
                            __extro_QPcEYf(55, __intro_cy6A3d(55, assert).strictEqual(signals._signals.length, 1));
                        }
                        {
                            __statement_gyZq0b(56);
                            __extro_QPcEYf(57, __intro_cy6A3d(57, signals).remove(signal));
                        }
                        {
                            __statement_gyZq0b(58);
                            __extro_QPcEYf(59, __intro_cy6A3d(59, assert).strictEqual(signals._signals.length, 0));
                        }
                    });
                }
            });
        }
        {
            __statement_gyZq0b(60);
            __expression_eg06U4(61), describe('dispatch(args)', function () {
                __block_nbIHVN(14);
                {
                    __statement_gyZq0b(62);
                    var signals = new Signals(), callCount = 0, args = undefined, calledWith = undefined, context = __extro_QPcEYf(63, __intro_cy6A3d(63, Object).create(null));
                }
                for (var i = 9; __expression_eg06U4(64), (__expression_eg06U4(65), i) >= 0; __expression_eg06U4(66), i--) {
                    __block_nbIHVN(15);
                    {
                        __statement_gyZq0b(67);
                        __extro_QPcEYf(68, __intro_cy6A3d(68, signals).add(function (argObj) {
                            __block_nbIHVN(16);
                            {
                                __statement_gyZq0b(69);
                                __expression_eg06U4(70), callCount++;
                            }
                            {
                                __statement_gyZq0b(71);
                                args = argObj;
                            }
                            {
                                __statement_gyZq0b(72);
                                calledWith = this;
                            }
                        }, context, i));
                    }
                }
                {
                    __statement_gyZq0b(73);
                    __expression_eg06U4(74), it('should invoke all signals', function () {
                        __block_nbIHVN(17);
                        {
                            __statement_gyZq0b(75);
                            __extro_QPcEYf(76, __intro_cy6A3d(76, signals).dispatch());
                        }
                        {
                            __statement_gyZq0b(77);
                            __extro_QPcEYf(78, __intro_cy6A3d(78, assert).strictEqual(callCount, 10));
                        }
                    });
                }
                {
                    __statement_gyZq0b(79);
                    __expression_eg06U4(80), it('should invoke each signal with arguments', function () {
                        __block_nbIHVN(18);
                        {
                            __statement_gyZq0b(81);
                            var argObj = __extro_QPcEYf(82, __intro_cy6A3d(82, Object).create(null));
                        }
                        {
                            __statement_gyZq0b(83);
                            __extro_QPcEYf(84, __intro_cy6A3d(84, signals).dispatch(argObj));
                        }
                        {
                            __statement_gyZq0b(85);
                            __extro_QPcEYf(86, __intro_cy6A3d(86, assert).strictEqual(args, argObj));
                        }
                    });
                }
                {
                    __statement_gyZq0b(87);
                    __expression_eg06U4(88), it('should invoke each signal with correct context', function () {
                        __block_nbIHVN(19);
                        {
                            __statement_gyZq0b(89);
                            __extro_QPcEYf(90, __intro_cy6A3d(90, signals).dispatch());
                        }
                        {
                            __statement_gyZq0b(91);
                            __extro_QPcEYf(92, __intro_cy6A3d(92, assert).strictEqual(calledWith, context));
                        }
                    });
                }
                {
                    __statement_gyZq0b(93);
                    __expression_eg06U4(94), it('should invoke each signal in correct order and halt on return false', function () {
                        __block_nbIHVN(20);
                        {
                            __statement_gyZq0b(95);
                            callCount = 0;
                        }
                        {
                            __statement_gyZq0b(96);
                            __extro_QPcEYf(97, __intro_cy6A3d(97, signals).add(function () {
                                __block_nbIHVN(21);
                                {
                                    __statement_gyZq0b(98);
                                    __expression_eg06U4(99), callCount++;
                                }
                                return __expression_eg06U4(100), false;
                            }, undefined, 4));
                        }
                        {
                            __statement_gyZq0b(101);
                            __extro_QPcEYf(102, __intro_cy6A3d(102, signals).dispatch());
                        }
                        {
                            __statement_gyZq0b(103);
                            __extro_QPcEYf(104, __intro_cy6A3d(104, assert).strictEqual(callCount, 5));
                        }
                    });
                }
            });
        }
    });
}