
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_ZSFkNE, __expression_prKn2h, __block_kolFmU;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_ZSFkNE = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/observer.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_prKn2h = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/observer.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_kolFmU = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/observer.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_xlooP4 = function(id, obj) {
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
    __extro_BWQKcd = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/observer.js');
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
    __statement_ZSFkNE(0);
    var Observer = (__expression_prKn2h(1), require('../src/observer')), assert = (__expression_prKn2h(2), require('assert'));
}
{
    __statement_ZSFkNE(3);
    __expression_prKn2h(4), describe('Observer', function () {
        __block_kolFmU(0);
        {
            __statement_ZSFkNE(5);
            __expression_prKn2h(6), it('should be loaded successfully', function () {
                __block_kolFmU(1);
                {
                    __statement_ZSFkNE(7);
                    __extro_BWQKcd(8, __intro_xlooP4(8, assert).notStrictEqual((__expression_prKn2h(9), typeof Observer), 'undefined'));
                }
            });
        }
        {
            __statement_ZSFkNE(10);
            __expression_prKn2h(11), describe('observe(obj)', function () {
                __block_kolFmU(2);
                {
                    __statement_ZSFkNE(12);
                    var mockObject = {
                            hello: 'world',
                            nested: {
                                obj: 'ect'
                            },
                            nest: [
                                'ed array'
                            ]
                        }, observed = __extro_BWQKcd(13, __intro_xlooP4(13, Observer).observe(mockObject));
                }
                {
                    __statement_ZSFkNE(14);
                    __expression_prKn2h(15), it('should not modify object', function () {
                        __block_kolFmU(3);
                        {
                            __statement_ZSFkNE(16);
                            var keys = __extro_BWQKcd(17, __intro_xlooP4(17, Object).keys(mockObject)), mockKeys = [
                                    'hello',
                                    'nested',
                                    'nest'
                                ];
                        }
                        {
                            __statement_ZSFkNE(18);
                            __extro_BWQKcd(19, __intro_xlooP4(19, assert).strictEqual(keys.length, mockKeys.length));
                        }
                        {
                            __statement_ZSFkNE(20);
                            __extro_BWQKcd(21, __intro_xlooP4(21, keys).forEach(function (key) {
                                __block_kolFmU(4);
                                {
                                    __statement_ZSFkNE(22);
                                    __extro_BWQKcd(23, __intro_xlooP4(23, assert).notStrictEqual(__extro_BWQKcd(24, __intro_xlooP4(24, mockKeys).indexOf(key)), (__expression_prKn2h(25), -1)));
                                }
                            }));
                        }
                    });
                }
                {
                    __statement_ZSFkNE(26);
                    __expression_prKn2h(27), it('should return an observable object with same values', function () {
                        __block_kolFmU(5);
                        {
                            __statement_ZSFkNE(28);
                            var keys = __extro_BWQKcd(29, __intro_xlooP4(29, Object).keys(mockObject));
                        }
                        {
                            __statement_ZSFkNE(30);
                            __extro_BWQKcd(31, __intro_xlooP4(31, keys).forEach(function (key) {
                                __block_kolFmU(6);
                                if (__expression_prKn2h(32), (__expression_prKn2h(33), typeof mockObject[key]) == 'object') {
                                    __block_kolFmU(7);
                                    {
                                        __statement_ZSFkNE(34);
                                        var k = __extro_BWQKcd(35, __intro_xlooP4(35, Object).keys(mockObject[key]));
                                    }
                                    {
                                        __statement_ZSFkNE(36);
                                        __extro_BWQKcd(37, __intro_xlooP4(37, k).forEach(function (ey) {
                                            __block_kolFmU(8);
                                            {
                                                __statement_ZSFkNE(38);
                                                __extro_BWQKcd(39, __intro_xlooP4(39, assert).equal(mockObject[key][ey], observed[key][ey]));
                                            }
                                        }));
                                    }
                                } else {
                                    __block_kolFmU(9);
                                    {
                                        __statement_ZSFkNE(40);
                                        __extro_BWQKcd(41, __intro_xlooP4(41, assert).equal(mockObject[key], observed[key]));
                                    }
                                }
                            }));
                        }
                    });
                }
                {
                    __statement_ZSFkNE(42);
                    __expression_prKn2h(43), it('should add mutation methods', function () {
                        __block_kolFmU(10);
                        {
                            __statement_ZSFkNE(44);
                            var methods = [
                                    'add',
                                    'remove',
                                    '_observers'
                                ];
                        }
                        {
                            __statement_ZSFkNE(45);
                            __extro_BWQKcd(46, __intro_xlooP4(46, methods).forEach(function (key) {
                                __block_kolFmU(11);
                                {
                                    __statement_ZSFkNE(47);
                                    __extro_BWQKcd(48, __intro_xlooP4(48, assert).notStrictEqual((__expression_prKn2h(49), typeof observed[key]), 'undefined'));
                                }
                            }));
                        }
                    });
                }
                {
                    __statement_ZSFkNE(50);
                    __expression_prKn2h(51), it('should make nested objects and arrays observable', function () {
                        __block_kolFmU(12);
                        {
                            __statement_ZSFkNE(52);
                            var methods = [
                                    'add',
                                    'remove',
                                    '_observers'
                                ], keys = __extro_BWQKcd(53, __intro_xlooP4(53, Object).keys(observed));
                        }
                        {
                            __statement_ZSFkNE(54);
                            __extro_BWQKcd(55, __intro_xlooP4(55, keys).forEach(function (key) {
                                __block_kolFmU(13);
                                if (__expression_prKn2h(56), (__expression_prKn2h(57), typeof observed[key]) == 'object') {
                                    __block_kolFmU(14);
                                    {
                                        __statement_ZSFkNE(58);
                                        __extro_BWQKcd(59, __intro_xlooP4(59, methods).forEach(function (method) {
                                            __block_kolFmU(15);
                                            {
                                                __statement_ZSFkNE(60);
                                                __extro_BWQKcd(61, __intro_xlooP4(61, assert).notStrictEqual((__expression_prKn2h(62), typeof observed[key][method]), 'undefined'));
                                            }
                                        }));
                                    }
                                }
                            }));
                        }
                    });
                }
                {
                    __statement_ZSFkNE(63);
                    __expression_prKn2h(64), describe('add(key, value)', function () {
                        __block_kolFmU(16);
                        {
                            __statement_ZSFkNE(65);
                            __extro_BWQKcd(66, __intro_xlooP4(66, observed).add('foo', 'bar'));
                        }
                        {
                            __statement_ZSFkNE(67);
                            __extro_BWQKcd(68, __intro_xlooP4(68, assert).strictEqual(observed.foo, 'bar'));
                        }
                    });
                }
                {
                    __statement_ZSFkNE(69);
                    __expression_prKn2h(70), describe('remove(key)', function () {
                        __block_kolFmU(17);
                    });
                }
            });
        }
        {
            __statement_ZSFkNE(71);
            __expression_prKn2h(72), describe('observe(arr)', function () {
                __block_kolFmU(18);
                {
                    __statement_ZSFkNE(73);
                    var mockArray = [
                            'cat',
                            'dog',
                            {
                                nested: 'object'
                            },
                            [
                                'nested array'
                            ]
                        ], observed = __extro_BWQKcd(74, __intro_xlooP4(74, Observer).observe(mockArray));
                }
                {
                    __statement_ZSFkNE(75);
                    __expression_prKn2h(76), it('should not modify array', function () {
                        __block_kolFmU(19);
                        {
                            __statement_ZSFkNE(77);
                            var keys = __extro_BWQKcd(78, __intro_xlooP4(78, Object).keys(mockArray));
                        }
                        {
                            __statement_ZSFkNE(79);
                            __extro_BWQKcd(80, __intro_xlooP4(80, assert).strictEqual(mockArray.length, 4));
                        }
                        {
                            __statement_ZSFkNE(81);
                            __extro_BWQKcd(82, __intro_xlooP4(82, assert).strictEqual(keys.length, 4));
                        }
                    });
                }
                {
                    __statement_ZSFkNE(83);
                    __expression_prKn2h(84), it('should return an observable array with same values', function () {
                        __block_kolFmU(20);
                        {
                            __statement_ZSFkNE(85);
                            var keys = __extro_BWQKcd(86, __intro_xlooP4(86, Object).keys(mockArray));
                        }
                        {
                            __statement_ZSFkNE(87);
                            __extro_BWQKcd(88, __intro_xlooP4(88, keys).forEach(function (key) {
                                __block_kolFmU(21);
                                if (__expression_prKn2h(89), (__expression_prKn2h(90), typeof mockArray[key]) == 'object') {
                                    __block_kolFmU(22);
                                    {
                                        __statement_ZSFkNE(91);
                                        var k = __extro_BWQKcd(92, __intro_xlooP4(92, Object).keys(mockArray[key]));
                                    }
                                    {
                                        __statement_ZSFkNE(93);
                                        __extro_BWQKcd(94, __intro_xlooP4(94, k).forEach(function (ey) {
                                            __block_kolFmU(23);
                                            {
                                                __statement_ZSFkNE(95);
                                                __extro_BWQKcd(96, __intro_xlooP4(96, assert).equal(mockArray[key][ey], observed[key][ey]));
                                            }
                                        }));
                                    }
                                } else {
                                    __block_kolFmU(24);
                                    {
                                        __statement_ZSFkNE(97);
                                        __extro_BWQKcd(98, __intro_xlooP4(98, assert).equal(mockArray[key], observed[key]));
                                    }
                                }
                            }));
                        }
                    });
                }
                {
                    __statement_ZSFkNE(99);
                    __expression_prKn2h(100), it('should add mutation methods', function () {
                        __block_kolFmU(25);
                        {
                            __statement_ZSFkNE(101);
                            var methods = [
                                    'add',
                                    'remove',
                                    '_observers'
                                ];
                        }
                        {
                            __statement_ZSFkNE(102);
                            __extro_BWQKcd(103, __intro_xlooP4(103, methods).forEach(function (key) {
                                __block_kolFmU(26);
                                {
                                    __statement_ZSFkNE(104);
                                    __extro_BWQKcd(105, __intro_xlooP4(105, assert).notStrictEqual((__expression_prKn2h(106), typeof observed[key]), 'undefined'));
                                }
                            }));
                        }
                    });
                }
                {
                    __statement_ZSFkNE(107);
                    __expression_prKn2h(108), it('should make nested objects and arrays observable', function () {
                        __block_kolFmU(27);
                        {
                            __statement_ZSFkNE(109);
                            var methods = [
                                    'add',
                                    'remove',
                                    '_observers'
                                ], keys = __extro_BWQKcd(110, __intro_xlooP4(110, Object).keys(observed));
                        }
                        {
                            __statement_ZSFkNE(111);
                            __extro_BWQKcd(112, __intro_xlooP4(112, keys).forEach(function (key) {
                                __block_kolFmU(28);
                                if (__expression_prKn2h(113), (__expression_prKn2h(114), typeof observed[key]) == 'object') {
                                    __block_kolFmU(29);
                                    {
                                        __statement_ZSFkNE(115);
                                        __extro_BWQKcd(116, __intro_xlooP4(116, methods).forEach(function (method) {
                                            __block_kolFmU(30);
                                            {
                                                __statement_ZSFkNE(117);
                                                __extro_BWQKcd(118, __intro_xlooP4(118, assert).notStrictEqual((__expression_prKn2h(119), typeof observed[key][method]), 'undefined'));
                                            }
                                        }));
                                    }
                                }
                            }));
                        }
                    });
                }
            });
        }
    });
}