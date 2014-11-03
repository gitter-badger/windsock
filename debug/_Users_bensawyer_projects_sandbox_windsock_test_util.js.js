
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_rrdecE, __expression_FVk1Eb, __block_B381Ns;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_rrdecE = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/util.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_FVk1Eb = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/util.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_B381Ns = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/util.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_qKwsWt = function(id, obj) {
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
    __extro_tZCI6P = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/util.js');
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
    __statement_rrdecE(0);
    var Util = (__expression_FVk1Eb(1), require('../src/util'));
}
{
    __statement_rrdecE(2);
    var assert = (__expression_FVk1Eb(3), require('assert'));
}
{
    __statement_rrdecE(4);
    __expression_FVk1Eb(5), describe('Util', function () {
        __block_B381Ns(0);
        {
            __statement_rrdecE(6);
            __expression_FVk1Eb(7), it('should be loaded successfully', function () {
                __block_B381Ns(1);
                {
                    __statement_rrdecE(8);
                    __extro_tZCI6P(9, __intro_qKwsWt(9, assert).notStrictEqual((__expression_FVk1Eb(10), typeof Util), 'undefined'));
                }
            });
        }
        {
            __statement_rrdecE(11);
            __expression_FVk1Eb(12), describe('nextTick(fn)', function () {
                __block_B381Ns(2);
                {
                    __statement_rrdecE(13);
                    __expression_FVk1Eb(14), it('should invoke callback on the next stack', function (done) {
                        __block_B381Ns(3);
                        {
                            __statement_rrdecE(15);
                            var called = false, callback = function () {
                                    __block_B381Ns(4);
                                    {
                                        __statement_rrdecE(16);
                                        called = true;
                                    }
                                    {
                                        __statement_rrdecE(17);
                                        __extro_tZCI6P(18, __intro_qKwsWt(18, assert).strictEqual(called, true));
                                    }
                                    {
                                        __statement_rrdecE(19);
                                        __expression_FVk1Eb(20), done();
                                    }
                                };
                        }
                        {
                            __statement_rrdecE(21);
                            __extro_tZCI6P(22, __intro_qKwsWt(22, Util).nextTick(callback));
                        }
                        {
                            __statement_rrdecE(23);
                            __extro_tZCI6P(24, __intro_qKwsWt(24, assert).strictEqual(called, false));
                        }
                    });
                }
            });
        }
        {
            __statement_rrdecE(25);
            __expression_FVk1Eb(26), describe('each(list, fn)', function () {
                __block_B381Ns(5);
                {
                    __statement_rrdecE(27);
                    var array = __extro_tZCI6P(28, __intro_qKwsWt(28, Array).apply(undefined, new Array(100))), count = 0;
                }
                {
                    __statement_rrdecE(29);
                    __expression_FVk1Eb(30), it('should iterate over a dense array for array.length', function () {
                        __block_B381Ns(6);
                        {
                            __statement_rrdecE(31);
                            count = 0;
                        }
                        {
                            __statement_rrdecE(32);
                            __extro_tZCI6P(33, __intro_qKwsWt(33, Util).each(array, function () {
                                __block_B381Ns(7);
                                {
                                    __statement_rrdecE(34);
                                    __expression_FVk1Eb(35), count++;
                                }
                            }));
                        }
                        {
                            __statement_rrdecE(36);
                            __extro_tZCI6P(37, __intro_qKwsWt(37, assert).equal(count, 100));
                        }
                    });
                }
                {
                    __statement_rrdecE(38);
                    __expression_FVk1Eb(39), it('should iterate over only an objects enumerable and non inherited properties', function () {
                        __block_B381Ns(8);
                        {
                            __statement_rrdecE(40);
                            var object = __extro_tZCI6P(41, __intro_qKwsWt(41, Object).create(Object.prototype));
                        }
                        {
                            __statement_rrdecE(42);
                            object.propA = 'A';
                        }
                        {
                            __statement_rrdecE(43);
                            object.propB = 'B';
                        }
                        {
                            __statement_rrdecE(44);
                            count = 0;
                        }
                        {
                            __statement_rrdecE(45);
                            __extro_tZCI6P(46, __intro_qKwsWt(46, Util).each(object, function () {
                                __block_B381Ns(9);
                                {
                                    __statement_rrdecE(47);
                                    __expression_FVk1Eb(48), count++;
                                }
                            }));
                        }
                        {
                            __statement_rrdecE(49);
                            __extro_tZCI6P(50, __intro_qKwsWt(50, assert).equal(count, 2));
                        }
                    });
                }
                {
                    __statement_rrdecE(51);
                    __expression_FVk1Eb(52), it('should break if exit object is returned from iterator', function () {
                        __block_B381Ns(10);
                        {
                            __statement_rrdecE(53);
                            count = 0;
                        }
                        {
                            __statement_rrdecE(54);
                            __extro_tZCI6P(55, __intro_qKwsWt(55, Util).each(array, function () {
                                __block_B381Ns(11);
                                {
                                    __statement_rrdecE(56);
                                    __expression_FVk1Eb(57), count++;
                                }
                                if (__expression_FVk1Eb(58), (__expression_FVk1Eb(59), count) === 50) {
                                    __block_B381Ns(12);
                                    return __expression_FVk1Eb(60), arguments[3];
                                }
                            }));
                        }
                        {
                            __statement_rrdecE(61);
                            __extro_tZCI6P(62, __intro_qKwsWt(62, assert).equal(count, 50));
                        }
                    });
                }
            });
        }
        {
            __statement_rrdecE(63);
            __expression_FVk1Eb(64), describe('traverse(list, fn)', function () {
                __block_B381Ns(13);
                {
                    __statement_rrdecE(65);
                    var array = [
                            [
                                [
                                    []
                                ]
                            ]
                        ], object = {
                            object: {
                                object: {
                                    object: {}
                                }
                            }
                        }, count = {
                            total: 0,
                            maxDepth: 0
                        };
                }
                {
                    __statement_rrdecE(66);
                    __expression_FVk1Eb(67), it('should deeply iterate over nested arrays', function () {
                        __block_B381Ns(14);
                        {
                            __statement_rrdecE(68);
                            count.total = 0;
                        }
                        {
                            __statement_rrdecE(69);
                            count.maxDepth = 0;
                        }
                        {
                            __statement_rrdecE(70);
                            __extro_tZCI6P(71, __intro_qKwsWt(71, Util).traverse(array, function () {
                                __block_B381Ns(15);
                                {
                                    __statement_rrdecE(72);
                                    __expression_FVk1Eb(73), count.total++;
                                }
                                {
                                    __statement_rrdecE(74);
                                    __expression_FVk1Eb(75), count.maxDepth++;
                                }
                            }));
                        }
                        {
                            __statement_rrdecE(76);
                            __extro_tZCI6P(77, __intro_qKwsWt(77, assert).equal(count.total, 3));
                        }
                        {
                            __statement_rrdecE(78);
                            __extro_tZCI6P(79, __intro_qKwsWt(79, assert).equal(count.maxDepth, 3));
                        }
                    });
                }
                {
                    __statement_rrdecE(80);
                    __expression_FVk1Eb(81), it('should deeply iterate over object keys', function () {
                        __block_B381Ns(16);
                        {
                            __statement_rrdecE(82);
                            count.total = 0;
                        }
                        {
                            __statement_rrdecE(83);
                            count.maxDepth = 0;
                        }
                        {
                            __statement_rrdecE(84);
                            __extro_tZCI6P(85, __intro_qKwsWt(85, Util).traverse(object, function () {
                                __block_B381Ns(17);
                                {
                                    __statement_rrdecE(86);
                                    __expression_FVk1Eb(87), count.total++;
                                }
                                {
                                    __statement_rrdecE(88);
                                    __expression_FVk1Eb(89), count.maxDepth++;
                                }
                            }));
                        }
                        {
                            __statement_rrdecE(90);
                            __extro_tZCI6P(91, __intro_qKwsWt(91, assert).equal(count.total, 3));
                        }
                        {
                            __statement_rrdecE(92);
                            __extro_tZCI6P(93, __intro_qKwsWt(93, assert).equal(count.maxDepth, 3));
                        }
                    });
                }
            });
        }
        {
            __statement_rrdecE(94);
            __expression_FVk1Eb(95), describe('extend(obj, source)', function () {
                __block_B381Ns(18);
                {
                    __statement_rrdecE(96);
                    __expression_FVk1Eb(97), it('should add the enumerable properties from source to target object', function () {
                        __block_B381Ns(19);
                        {
                            __statement_rrdecE(98);
                            var targetObj = {};
                        }
                        {
                            __statement_rrdecE(99);
                            var sourceObj = __extro_tZCI6P(100, __intro_qKwsWt(100, Object).create(Object.prototype));
                        }
                        {
                            __statement_rrdecE(101);
                            sourceObj.propA = 'a';
                        }
                        {
                            __statement_rrdecE(102);
                            sourceObj.propB = {};
                        }
                        {
                            __statement_rrdecE(103);
                            __extro_tZCI6P(104, __intro_qKwsWt(104, Util).extend(targetObj, sourceObj));
                        }
                        {
                            __statement_rrdecE(105);
                            __extro_tZCI6P(106, __intro_qKwsWt(106, assert).strictEqual(targetObj.propA, 'a'));
                        }
                        {
                            __statement_rrdecE(107);
                            __extro_tZCI6P(108, __intro_qKwsWt(108, assert).strictEqual(targetObj.propB, sourceObj.propB));
                        }
                    });
                }
            });
        }
        {
            __statement_rrdecE(109);
            __expression_FVk1Eb(110), describe('inherit(construct, superConstruct)', function () {
                __block_B381Ns(20);
                {
                    __statement_rrdecE(111);
                    var classAConstCalled = false;
                }
                {
                    __statement_rrdecE(112);
                    var classA = function () {
                            __block_B381Ns(21);
                            {
                                __statement_rrdecE(113);
                                classAConstCalled = true;
                            }
                        }, classB = function () {
                            __block_B381Ns(22);
                        };
                }
                {
                    __statement_rrdecE(114);
                    classA.prototype = {
                        propA: 'a',
                        propB: function () {
                            __block_B381Ns(23);
                        }
                    };
                }
                {
                    __statement_rrdecE(115);
                    classB.prototype = {
                        propC: 'c',
                        propD: function () {
                            __block_B381Ns(24);
                        }
                    };
                }
                {
                    __statement_rrdecE(116);
                    __expression_FVk1Eb(117), it('should inherit the superConstructor prototype', function () {
                        __block_B381Ns(25);
                        {
                            __statement_rrdecE(118);
                            __extro_tZCI6P(119, __intro_qKwsWt(119, Util).inherit(classA, classB));
                        }
                        {
                            __statement_rrdecE(120);
                            var inherited = new classA();
                        }
                        {
                            __statement_rrdecE(121);
                            __extro_tZCI6P(122, __intro_qKwsWt(122, assert).strictEqual(classA.prototype.propC, 'c'));
                        }
                        {
                            __statement_rrdecE(123);
                            __extro_tZCI6P(124, __intro_qKwsWt(124, assert).strictEqual((__expression_FVk1Eb(125), typeof classB.prototype.propA), 'undefined'));
                        }
                        {
                            __statement_rrdecE(126);
                            __extro_tZCI6P(127, __intro_qKwsWt(127, assert).strictEqual(classAConstCalled, true));
                        }
                    });
                }
            });
        }
    });
}