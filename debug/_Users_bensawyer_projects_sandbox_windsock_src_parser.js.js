
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_K2kGEj, __expression_Q03ICY, __block_o_$QzQ;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_K2kGEj = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/parser.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_Q03ICY = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/parser.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_o_$QzQ = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/parser.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_ZCq6WD = function(id, obj) {
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
    __extro_IJgPMh = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/src/parser.js');
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
    __statement_K2kGEj(0);
    var Signals = (__expression_Q03ICY(1), require('./signals')), util = (__expression_Q03ICY(2), require('./util')), extend = util.extend, each = util.each, is = util.is;
}
{
    __statement_K2kGEj(3);
    var voidTags = [
            'area',
            'base',
            'br',
            'col',
            'command',
            'embed',
            'hr',
            'img',
            'input',
            'keygen',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr'
        ];
}
function parseTag(tag) {
    __block_o_$QzQ(0);
    {
        __statement_K2kGEj(4);
        var node = (__expression_Q03ICY(5), createNode()), reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g;
    }
    {
        __statement_K2kGEj(6);
        var m = __extro_IJgPMh(7, __intro_ZCq6WD(7, tag).match(reg));
    }
    if (__expression_Q03ICY(8), m.length > 1) {
        __block_o_$QzQ(1);
        {
            __statement_K2kGEj(9);
            node.attributes = __extro_IJgPMh(10, __intro_ZCq6WD(10, Object).create(null));
        }
    }
    for (var i = 0, l = m.length; __expression_Q03ICY(11), (__expression_Q03ICY(12), i) < (__expression_Q03ICY(13), l); __expression_Q03ICY(14), i++) {
        __block_o_$QzQ(2);
        {
            __statement_K2kGEj(15);
            var keyVal = __extro_IJgPMh(16, __intro_ZCq6WD(16, m[i]).split('='));
        }
        if (__expression_Q03ICY(17), (__expression_Q03ICY(18), i) === 0) {
            __block_o_$QzQ(3);
            {
                __statement_K2kGEj(19);
                node.name = __extro_IJgPMh(20, __intro_ZCq6WD(20, __extro_IJgPMh(21, __intro_ZCq6WD(21, keyVal[0]).replace(/[\/>]/g, ''))).trim());
            }
        } else if (__expression_Q03ICY(22), keyVal.length > 1) {
            __block_o_$QzQ(4);
            {
                __statement_K2kGEj(23);
                node.attributes[__extro_IJgPMh(24, __intro_ZCq6WD(24, keyVal[0]).trim())] = __extro_IJgPMh(25, __intro_ZCq6WD(25, __extro_IJgPMh(26, __intro_ZCq6WD(26, keyVal[1]).replace(/["'>]/g, ''))).trim());
            }
        } else {
            __block_o_$QzQ(5);
            {
                __statement_K2kGEj(27);
                node.attributes[__extro_IJgPMh(28, __intro_ZCq6WD(28, __extro_IJgPMh(29, __intro_ZCq6WD(29, keyVal[0]).replace(/[>]/g, ''))).trim())] = null;
            }
        }
    }
    return __expression_Q03ICY(30), node;
}
function isVoid(tag) {
    __block_o_$QzQ(6);
    for (var i = 0, l = voidTags.length; __expression_Q03ICY(31), (__expression_Q03ICY(32), i) < (__expression_Q03ICY(33), l); __expression_Q03ICY(34), i++) {
        __block_o_$QzQ(7);
        if (__expression_Q03ICY(35), voidTags[i] === (__expression_Q03ICY(36), tag)) {
            __block_o_$QzQ(8);
            return __expression_Q03ICY(37), true;
        }
    }
    return __expression_Q03ICY(38), false;
}
function createNode() {
    __block_o_$QzQ(9);
    return __expression_Q03ICY(39), __extro_IJgPMh(40, __intro_ZCq6WD(40, Object).create(null, {
        name: {
            value: '',
            enumerable: true,
            writable: true
        }
    }));
}
{
    __statement_K2kGEj(41);
    Parser.signals = [
        'start',
        'content',
        'end',
        'done'
    ];
}
function Parser(callbacks) {
    __block_o_$QzQ(10);
    {
        __statement_K2kGEj(42);
        var selfie = this;
    }
    {
        __statement_K2kGEj(43);
        __expression_Q03ICY(44), each(Parser.signals, function (name) {
            __block_o_$QzQ(11);
            {
                __statement_K2kGEj(45);
                selfie[name] = new Signals();
            }
            if (__expression_Q03ICY(46), (__expression_Q03ICY(47), (__expression_Q03ICY(48), typeof callbacks) !== 'undefined') && (__expression_Q03ICY(49), (__expression_Q03ICY(50), typeof callbacks[name]) !== 'undefined')) {
                __block_o_$QzQ(12);
                {
                    __statement_K2kGEj(51);
                    __extro_IJgPMh(52, __intro_ZCq6WD(52, selfie[name]).add(callbacks[name], selfie));
                }
            }
        });
    }
}
{
    __statement_K2kGEj(53);
    Parser.prototype.parse = function (obj) {
        __block_o_$QzQ(13);
        if (__expression_Q03ICY(54), !(__expression_Q03ICY(55), obj)) {
            __block_o_$QzQ(14);
            return __expression_Q03ICY(56);
        }
        if (__expression_Q03ICY(57), is(obj, 'string')) {
            __block_o_$QzQ(15);
            return __expression_Q03ICY(58), __extro_IJgPMh(59, __intro_ZCq6WD(59, this).parseHTML(obj));
        } else if (obj.nodeName) {
            __block_o_$QzQ(16);
            return __expression_Q03ICY(60), __extro_IJgPMh(61, __intro_ZCq6WD(61, this).parseDOM(obj));
        } else {
            __block_o_$QzQ(17);
            return __expression_Q03ICY(62), __extro_IJgPMh(63, __intro_ZCq6WD(63, this).parseJSONML(obj));
        }
    };
}
{
    __statement_K2kGEj(64);
    Parser.prototype.parseDOM = function (node) {
        __block_o_$QzQ(18);
        {
            __statement_K2kGEj(65);
            var self = this;
        }
        if (__expression_Q03ICY(66), node.nodeName === 'SCRIPT') {
            __block_o_$QzQ(19);
            return __expression_Q03ICY(67);
        }
        {
            __statement_K2kGEj(68);
            var attr = __extro_IJgPMh(69, __intro_ZCq6WD(69, Object).create(null));
        }
        {
            __statement_K2kGEj(70);
            __expression_Q03ICY(71), each(node.attributes, function (attribute, index) {
                __block_o_$QzQ(20);
                {
                    __statement_K2kGEj(72);
                    attr[attribute.nodeName] = attribute.nodeValue;
                }
            });
        }
        if (__extro_IJgPMh(73, __intro_ZCq6WD(73, node).hasChildNodes())) {
            __block_o_$QzQ(21);
            {
                __statement_K2kGEj(74);
                var childNodes = node.childNodes;
            }
            for (var i = 0; __expression_Q03ICY(75), (__expression_Q03ICY(76), i) < childNodes.length; __expression_Q03ICY(77), i++) {
                __block_o_$QzQ(22);
                if (__expression_Q03ICY(78), childNodes[i].nodeType == 1) {
                    __block_o_$QzQ(23);
                } else if (__expression_Q03ICY(79), childNodes[i].nodeType == 3) {
                    __block_o_$QzQ(24);
                }
            }
        }
    };
}
{
    __statement_K2kGEj(80);
    Parser.prototype.parseJSONML = function (jsonml) {
        __block_o_$QzQ(25);
        {
            __statement_K2kGEj(81);
            var i = 1, node;
        }
        if (__expression_Q03ICY(82), is(jsonml[0], 'array')) {
            __block_o_$QzQ(26);
            {
                __statement_K2kGEj(83);
                __extro_IJgPMh(84, __intro_ZCq6WD(84, this).parseJSONML(jsonml[0]));
            }
        } else {
            __block_o_$QzQ(27);
            {
                __statement_K2kGEj(85);
                node = (__expression_Q03ICY(86), createNode());
            }
            {
                __statement_K2kGEj(87);
                node.name = jsonml[0];
            }
            if (__expression_Q03ICY(88), is(jsonml[1], 'object')) {
                __block_o_$QzQ(28);
                {
                    __statement_K2kGEj(89);
                    __expression_Q03ICY(90), i++;
                }
                {
                    __statement_K2kGEj(91);
                    node.attributes = (__expression_Q03ICY(92), extend(__extro_IJgPMh(93, __intro_ZCq6WD(93, Object).create(null)), jsonml[1]));
                }
            }
            if (__expression_Q03ICY(94), !(__expression_Q03ICY(95), isVoid(node.name))) {
                __block_o_$QzQ(29);
                {
                    __statement_K2kGEj(96);
                    __extro_IJgPMh(97, __intro_ZCq6WD(97, this.start).dispatch(node));
                }
            }
        }
        while (__expression_Q03ICY(98), (__expression_Q03ICY(99), i) < jsonml.length) {
            __block_o_$QzQ(30);
            if (__expression_Q03ICY(100), is(jsonml[i], 'string')) {
                __block_o_$QzQ(31);
                {
                    __statement_K2kGEj(101);
                    __extro_IJgPMh(102, __intro_ZCq6WD(102, this.content).dispatch(jsonml[i]));
                }
            } else {
                __block_o_$QzQ(32);
                {
                    __statement_K2kGEj(103);
                    __extro_IJgPMh(104, __intro_ZCq6WD(104, this).parseJSONML(jsonml[i]));
                }
            }
            {
                __statement_K2kGEj(105);
                __expression_Q03ICY(106), i++;
            }
        }
        if (__expression_Q03ICY(107), (__expression_Q03ICY(108), typeof node) === 'undefined') {
            __block_o_$QzQ(33);
            return __expression_Q03ICY(109);
        }
        if (__expression_Q03ICY(110), node.attributes && (__expression_Q03ICY(111), !(__expression_Q03ICY(112), isVoid(node.name)))) {
            __block_o_$QzQ(34);
            {
                __statement_K2kGEj(113);
                __expression_Q03ICY(114), delete node.attributes;
            }
        }
        {
            __statement_K2kGEj(115);
            __extro_IJgPMh(116, __intro_ZCq6WD(116, this.end).dispatch(node));
        }
    };
}
{
    __statement_K2kGEj(117);
    Parser.prototype.parseHTML = function (markup) {
        __block_o_$QzQ(35);
        if (__expression_Q03ICY(118), !(__expression_Q03ICY(119), markup)) {
            __block_o_$QzQ(36);
            return __expression_Q03ICY(120);
        }
        {
            __statement_K2kGEj(121);
            markup = __extro_IJgPMh(122, __intro_ZCq6WD(122, __extro_IJgPMh(123, __intro_ZCq6WD(123, __extro_IJgPMh(124, __intro_ZCq6WD(124, markup).toString())).replace(/\n/g, ''))).replace(/\r/g, ''));
        }
        while (__expression_Q03ICY(125), markup) {
            __block_o_$QzQ(37);
            {
                __statement_K2kGEj(126);
                var nextTagIndex = __extro_IJgPMh(127, __intro_ZCq6WD(127, markup).indexOf('<'));
            }
            if (__expression_Q03ICY(128), (__expression_Q03ICY(129), nextTagIndex) >= 0) {
                __block_o_$QzQ(38);
                if (__expression_Q03ICY(130), (__expression_Q03ICY(131), nextTagIndex) > 0) {
                    __block_o_$QzQ(39);
                    {
                        __statement_K2kGEj(132);
                        __extro_IJgPMh(133, __intro_ZCq6WD(133, this.content).dispatch(__extro_IJgPMh(134, __intro_ZCq6WD(134, markup).substring(0, nextTagIndex))));
                    }
                }
                {
                    __statement_K2kGEj(135);
                    markup = __extro_IJgPMh(136, __intro_ZCq6WD(136, markup).substring(nextTagIndex));
                }
                {
                    __statement_K2kGEj(137);
                    var endOfTagIndex = (__expression_Q03ICY(138), __extro_IJgPMh(139, __intro_ZCq6WD(139, markup).indexOf('>')) + 1), startTag = __extro_IJgPMh(140, __intro_ZCq6WD(140, markup).substring(0, endOfTagIndex)), parsedTag = (__expression_Q03ICY(141), parseTag(startTag)), voidTag = (__expression_Q03ICY(142), (__expression_Q03ICY(143), markup[__expression_Q03ICY(144), startTag.length - 2] === '/') || (__expression_Q03ICY(145), isVoid(parsedTag.name)));
                }
                if (__expression_Q03ICY(146), startTag[1] === '!') {
                    __block_o_$QzQ(40);
                    {
                        __statement_K2kGEj(147);
                        endOfTagIndex = (__expression_Q03ICY(148), __extro_IJgPMh(149, __intro_ZCq6WD(149, markup).indexOf('-->')) + 1);
                    }
                } else if (__expression_Q03ICY(150), (__expression_Q03ICY(151), startTag[1] === '/') || (__expression_Q03ICY(152), voidTag)) {
                    __block_o_$QzQ(41);
                    {
                        __statement_K2kGEj(153);
                        __extro_IJgPMh(154, __intro_ZCq6WD(154, this.end).dispatch(parsedTag, voidTag));
                    }
                } else {
                    __block_o_$QzQ(42);
                    {
                        __statement_K2kGEj(155);
                        __extro_IJgPMh(156, __intro_ZCq6WD(156, this.start).dispatch(parsedTag));
                    }
                }
                {
                    __statement_K2kGEj(157);
                    markup = __extro_IJgPMh(158, __intro_ZCq6WD(158, markup).substring(endOfTagIndex));
                }
            } else {
                __block_o_$QzQ(43);
                {
                    __statement_K2kGEj(159);
                    __extro_IJgPMh(160, __intro_ZCq6WD(160, this.content).dispatch(markup));
                }
                {
                    __statement_K2kGEj(161);
                    markup = null;
                }
            }
        }
        return __expression_Q03ICY(162), __extro_IJgPMh(163, __intro_ZCq6WD(163, this.done).dispatch());
    };
}
{
    __statement_K2kGEj(164);
    module.exports = Parser;
}