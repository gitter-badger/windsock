
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_W_gvbk, __expression_cPWrib, __block_JwEBpq;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_W_gvbk = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/markup.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_cPWrib = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/markup.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_JwEBpq = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/markup.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_JrXmfA = function(id, obj) {
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
    __extro_eLkdiG = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/markup.js');
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
    __statement_W_gvbk(0);
    __expression_cPWrib(1), function () {
        __block_JwEBpq(0);
        {
            __statement_W_gvbk(2);
            'use strict';
        }
        {
            __statement_W_gvbk(3);
            var Parser = (__expression_cPWrib(4), require('./parser')), Signals = (__expression_cPWrib(5), require('./signals')), util = (__expression_cPWrib(6), require('./util')), is = util.is, each = util.each, merge = util.merge, extend = util.extend, traverse = util.traverse;
        }
        function Markup(obj, options) {
            __block_JwEBpq(1);
            {
                __statement_W_gvbk(7);
                __expression_cPWrib(8), merge(this.options, options);
            }
            {
                __statement_W_gvbk(9);
                this._selection = this._jsonml = [];
            }
            {
                __statement_W_gvbk(10);
                var parser = new Parser(this.options.parser);
            }
            {
                __statement_W_gvbk(11);
                var parseSignal = __extro_eLkdiG(12, __intro_JrXmfA(12, Signals.Signal).extend({
                        markup: this
                    }, function (fn) {
                        __block_JwEBpq(2);
                        {
                            __statement_W_gvbk(13);
                            this._signal = fn;
                        }
                    }));
            }
            {
                __statement_W_gvbk(14);
                var tagsig = new parseSignal(function (tag, voidTag) {
                        __block_JwEBpq(3);
                        if (__expression_cPWrib(15), (__expression_cPWrib(16), voidTag) || (__expression_cPWrib(17), (__expression_cPWrib(18), typeof voidTag) === 'undefined')) {
                            __block_JwEBpq(4);
                            if (__expression_cPWrib(19), voidTag) {
                                __block_JwEBpq(5);
                                {
                                    __statement_W_gvbk(20);
                                    __extro_eLkdiG(21, __intro_JrXmfA(21, this.markup).append(tag));
                                }
                            } else {
                                __block_JwEBpq(6);
                                {
                                    __statement_W_gvbk(22);
                                    __extro_eLkdiG(23, __intro_JrXmfA(23, this.markup).insert(tag));
                                }
                            }
                        } else {
                            __block_JwEBpq(7);
                            {
                                __statement_W_gvbk(24);
                                __extro_eLkdiG(25, __intro_JrXmfA(25, this.markup).parent());
                            }
                        }
                    });
            }
            {
                __statement_W_gvbk(26);
                var endtag;
            }
            {
                __statement_W_gvbk(27);
                var contentsig = new parseSignal(function (content) {
                        __block_JwEBpq(8);
                        if (content.length) {
                            __block_JwEBpq(9);
                            {
                                __statement_W_gvbk(28);
                                __extro_eLkdiG(29, __intro_JrXmfA(29, this.markup).append(content));
                            }
                        }
                    });
            }
            {
                __statement_W_gvbk(30);
                __extro_eLkdiG(31, __intro_JrXmfA(31, parser.start).add(tagsig));
            }
            {
                __statement_W_gvbk(32);
                __extro_eLkdiG(33, __intro_JrXmfA(33, parser.content).add(contentsig));
            }
            {
                __statement_W_gvbk(34);
                __extro_eLkdiG(35, __intro_JrXmfA(35, parser.end).add(tagsig));
            }
            {
                __statement_W_gvbk(36);
                __extro_eLkdiG(37, __intro_JrXmfA(37, parser).parse(obj));
            }
        }
        {
            __statement_W_gvbk(38);
            Markup.prototype.options = {
                parser: {
                    async: false,
                    flowing: true
                }
            };
        }
        {
            __statement_W_gvbk(39);
            Markup.prototype.each = function (fn) {
                __block_JwEBpq(10);
                {
                    __statement_W_gvbk(40);
                    var args = __extro_eLkdiG(41, __intro_JrXmfA(41, Array.prototype).slice(arguments, 1));
                }
                {
                    __statement_W_gvbk(42);
                    __extro_eLkdiG(43, __intro_JrXmfA(43, each).apply(this, __extro_eLkdiG(44, __intro_JrXmfA(44, [
                        this._selection,
                        fn
                    ]).concat(args))));
                }
                return __expression_cPWrib(45), this;
            };
        }
        {
            __statement_W_gvbk(46);
            Markup.prototype.traverse = function (fn, selection) {
                __block_JwEBpq(11);
                {
                    __statement_W_gvbk(47);
                    selection = (__expression_cPWrib(48), (__expression_cPWrib(49), selection) || this._selection);
                }
                {
                    __statement_W_gvbk(50);
                    __extro_eLkdiG(51, __intro_JrXmfA(51, traverse).call(this, selection, fn));
                }
                return __expression_cPWrib(52), this;
            };
        }
        {
            __statement_W_gvbk(53);
            Markup.prototype.append = function (obj) {
                __block_JwEBpq(12);
                {
                    __statement_W_gvbk(54);
                    __extro_eLkdiG(55, __intro_JrXmfA(55, this._selection).push(__extro_eLkdiG(56, __intro_JrXmfA(56, this).convert(obj))));
                }
            };
        }
        {
            __statement_W_gvbk(57);
            Markup.prototype.insert = function (obj, i) {
                __block_JwEBpq(13);
                {
                    __statement_W_gvbk(58);
                    var jsonml = (__expression_cPWrib(61), is(obj, 'object')) ? (__expression_cPWrib(59), __extro_eLkdiG(62, __intro_JrXmfA(62, this).convert(obj))) : (__expression_cPWrib(60), obj), index = 0;
                }
                if (__expression_cPWrib(63), (__expression_cPWrib(64), i) && (__expression_cPWrib(65), (__expression_cPWrib(66), i) > 0)) {
                    __block_JwEBpq(14);
                    {
                        __statement_W_gvbk(67);
                        __extro_eLkdiG(68, __intro_JrXmfA(68, Array.prototype.splice).call(this._selection, i, 0, jsonml));
                    }
                    {
                        __statement_W_gvbk(69);
                        index = (__expression_cPWrib(70), this._selection.length - 1);
                    }
                } else {
                    __block_JwEBpq(15);
                    {
                        __statement_W_gvbk(71);
                        index = (__expression_cPWrib(72), __extro_eLkdiG(73, __intro_JrXmfA(73, Array.prototype.push).call(this._selection, jsonml)) - 1);
                    }
                }
                if (__expression_cPWrib(74), is(jsonml, 'array')) {
                    __block_JwEBpq(16);
                    {
                        __statement_W_gvbk(75);
                        this._selection = this._selection[index];
                    }
                }
                return __expression_cPWrib(76), this;
            };
        }
        {
            __statement_W_gvbk(77);
            Markup.prototype.convert = function (obj) {
                __block_JwEBpq(17);
                if (__expression_cPWrib(78), (__expression_cPWrib(79), is(obj, 'string')) || (__expression_cPWrib(80), is(obj, 'array'))) {
                    __block_JwEBpq(18);
                    return __expression_cPWrib(81), obj;
                }
                {
                    __statement_W_gvbk(82);
                    var jsonml = [];
                }
                {
                    __statement_W_gvbk(83);
                    jsonml[0] = obj.nodeName;
                }
                if (__expression_cPWrib(84), obj.attributes && (__expression_cPWrib(85), !__extro_eLkdiG(86, __intro_JrXmfA(86, util).isEmpty(obj.attributes)))) {
                    __block_JwEBpq(19);
                    {
                        __statement_W_gvbk(87);
                        jsonml[1] = obj.attributes;
                    }
                }
                return __expression_cPWrib(88), jsonml;
            };
        }
        {
            __statement_W_gvbk(89);
            Markup.prototype.find = function (query) {
                __block_JwEBpq(20);
                if (__expression_cPWrib(90), is(query, 'number')) {
                    __block_JwEBpq(21);
                    {
                        __statement_W_gvbk(91);
                        this._selection = this._selection[query];
                    }
                    return __expression_cPWrib(92), this;
                }
                if (__expression_cPWrib(93), !(__expression_cPWrib(94), query)) {
                    __block_JwEBpq(22);
                    {
                        __statement_W_gvbk(95);
                        this._selection = this._jsonml;
                    }
                    return __expression_cPWrib(96), this;
                }
                {
                    __statement_W_gvbk(97);
                    var args = __extro_eLkdiG(98, __intro_JrXmfA(98, Array.prototype.slice).call(arguments));
                }
                {
                    __statement_W_gvbk(99);
                    var queryObject = {
                            nodeName: '',
                            attributes: {}
                        };
                }
                if (__expression_cPWrib(100), args.length > 1) {
                    __block_JwEBpq(23);
                    {
                        __statement_W_gvbk(101);
                        queryObject.attributes[args[0]] = queryObject.attributes[args[1]];
                    }
                } else if (__expression_cPWrib(102), is(query, 'string')) {
                    __block_JwEBpq(24);
                    {
                        __statement_W_gvbk(103);
                        queryObject.nodeName = query;
                    }
                } else if (__expression_cPWrib(104), is(query, 'object')) {
                    __block_JwEBpq(25);
                    {
                        __statement_W_gvbk(105);
                        __expression_cPWrib(106), extend(queryObject, query);
                    }
                }
                {
                    __statement_W_gvbk(107);
                    var match = new Markup();
                }
                {
                    __statement_W_gvbk(108);
                    __extro_eLkdiG(109, __intro_JrXmfA(109, this).traverse(function (val, index, node, exit) {
                        __block_JwEBpq(26);
                        if (__expression_cPWrib(110), (__expression_cPWrib(111), (__expression_cPWrib(112), index) > 0) || (__expression_cPWrib(113), is(node, 'object'))) {
                            __block_JwEBpq(27);
                            return __expression_cPWrib(114);
                        }
                        {
                            __statement_W_gvbk(115);
                            __extro_eLkdiG(116, __intro_JrXmfA(116, console).log('matching'));
                        }
                        {
                            __statement_W_gvbk(117);
                            __extro_eLkdiG(118, __intro_JrXmfA(118, console).log(node));
                        }
                        {
                            __statement_W_gvbk(119);
                            __extro_eLkdiG(120, __intro_JrXmfA(120, console).log(queryObject));
                        }
                        if (queryObject.nodeName.length) {
                            __block_JwEBpq(28);
                            if (__expression_cPWrib(121), node[0] !== queryObject.nodeName) {
                                __block_JwEBpq(29);
                                return __expression_cPWrib(122);
                            }
                        }
                        if (__expression_cPWrib(123), !__extro_eLkdiG(124, __intro_JrXmfA(124, util).isEmpty(queryObject.attributes))) {
                            __block_JwEBpq(30);
                            if (__expression_cPWrib(125), !(__expression_cPWrib(126), is(node[1], 'object'))) {
                                __block_JwEBpq(31);
                                return __expression_cPWrib(127);
                            }
                            if (__extro_eLkdiG(128, __intro_JrXmfA(128, util).match(node[1], queryObject))) {
                                __block_JwEBpq(32);
                                {
                                    __statement_W_gvbk(129);
                                    __extro_eLkdiG(130, __intro_JrXmfA(130, match).append(node));
                                }
                                {
                                    __statement_W_gvbk(131);
                                    __extro_eLkdiG(132, __intro_JrXmfA(132, console).log('match'));
                                }
                            }
                        } else {
                            __block_JwEBpq(33);
                            {
                                __statement_W_gvbk(133);
                                __extro_eLkdiG(134, __intro_JrXmfA(134, match).append(node));
                            }
                            {
                                __statement_W_gvbk(135);
                                __extro_eLkdiG(136, __intro_JrXmfA(136, console).log('match'));
                            }
                        }
                    }, this._jsonml));
                }
                if (match._jsonml.length) {
                    __block_JwEBpq(34);
                    return __expression_cPWrib(137), match;
                }
                return __expression_cPWrib(138), this;
            };
        }
        {
            __statement_W_gvbk(139);
            Markup.prototype.replace = function (v) {
                __block_JwEBpq(35);
                {
                    __statement_W_gvbk(140);
                    this._selection = v;
                }
                return __expression_cPWrib(141), this;
            };
        }
        {
            __statement_W_gvbk(142);
            Markup.prototype.children = function (selection, qualifier) {
                __block_JwEBpq(36);
                {
                    __statement_W_gvbk(143);
                    selection = (__expression_cPWrib(144), (__expression_cPWrib(145), selection) || this._selection);
                }
                {
                    __statement_W_gvbk(146);
                    qualifier = (__expression_cPWrib(147), (__expression_cPWrib(148), qualifier) || function () {
                        __block_JwEBpq(37);
                        return __expression_cPWrib(149), true;
                    });
                }
                {
                    __statement_W_gvbk(150);
                    var sweetChidrens = [];
                }
                {
                    __statement_W_gvbk(151);
                    __expression_cPWrib(152), each(selection, function (child) {
                        __block_JwEBpq(38);
                        if (__expression_cPWrib(153), (__expression_cPWrib(154), is(child, 'array')) && __extro_eLkdiG(155, __intro_JrXmfA(155, qualifier).call(this, child))) {
                            __block_JwEBpq(39);
                            {
                                __statement_W_gvbk(156);
                                __extro_eLkdiG(157, __intro_JrXmfA(157, sweetChidrens).push(child));
                            }
                        }
                    }, this);
                }
                return __expression_cPWrib(158), new Markup(sweetChidrens, this.options);
            };
        }
        {
            __statement_W_gvbk(159);
            Markup.prototype.parent = function () {
                __block_JwEBpq(40);
                {
                    __statement_W_gvbk(160);
                    __extro_eLkdiG(161, __intro_JrXmfA(161, this).traverse(function (node, index, parent, exit) {
                        __block_JwEBpq(41);
                        if (__expression_cPWrib(162), (__expression_cPWrib(163), index) > 0) {
                            __block_JwEBpq(42);
                            return __expression_cPWrib(164);
                        }
                        {
                            __statement_W_gvbk(165);
                            var match = __extro_eLkdiG(166, __intro_JrXmfA(166, this).children(parent, function (child) {
                                    __block_JwEBpq(43);
                                    if (__expression_cPWrib(167), (__expression_cPWrib(168), child) == this._selection) {
                                        __block_JwEBpq(44);
                                        return __expression_cPWrib(169), true;
                                    }
                                    return __expression_cPWrib(170), false;
                                }));
                        }
                        if (match._jsonml.length) {
                            __block_JwEBpq(45);
                            {
                                __statement_W_gvbk(171);
                                this._selection = parent;
                            }
                            return __expression_cPWrib(172), exit;
                        }
                    }, this._jsonml));
                }
                return __expression_cPWrib(173), this;
            };
        }
        {
            __statement_W_gvbk(174);
            Markup.prototype.jsonml = function () {
                __block_JwEBpq(46);
                return __expression_cPWrib(175), this._jsonml;
            };
        }
        {
            __statement_W_gvbk(176);
            module.exports = Markup;
        }
    }();
}