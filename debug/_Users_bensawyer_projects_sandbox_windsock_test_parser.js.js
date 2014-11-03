
// Instrumentation Header
{
    var fs = require('fs');
    var __statement_ReAVeu, __expression_mD6ERR, __block_Qqs4PT;
    var store = require('/Users/bensawyer/projects/sandbox/windsock/node_modules/gulp-coverage/contrib/coverage_store.js');
    
    __statement_ReAVeu = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/parser.js');
        fs.writeSync(fd, '{"statement": {"node": ' + i + '}},\n');
    }; 
    
    __expression_mD6ERR = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/parser.js');
        fs.writeSync(fd, '{"expression": {"node": ' + i + '}},\n');
    }; 
    
    __block_Qqs4PT = function(i) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/parser.js');
        fs.writeSync(fd, '{"block": ' + i + '},\n');
    }; 
    __intro_Eakd1U = function(id, obj) {
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
    __extro_agqCI4 = function(id, obj) {
        var fd = store.register('/Users/bensawyer/projects/sandbox/windsock/test/parser.js');
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
    __statement_ReAVeu(0);
    var Parser = (__expression_mD6ERR(1), require('../src/parser')), assert = (__expression_mD6ERR(2), require('assert'));
}
{
    __statement_ReAVeu(3);
    __expression_mD6ERR(4), describe('Parser', function () {
        __block_Qqs4PT(0);
        {
            __statement_ReAVeu(5);
            __expression_mD6ERR(6), it('should be loaded successfully', function () {
                __block_Qqs4PT(1);
                {
                    __statement_ReAVeu(7);
                    __extro_agqCI4(8, __intro_Eakd1U(8, assert).notStrictEqual((__expression_mD6ERR(9), typeof Parser), 'undefined'));
                }
            });
        }
        {
            __statement_ReAVeu(10);
            __expression_mD6ERR(11), describe('parseJSONML(jsonmlObject)', function () {
                __block_Qqs4PT(2);
                {
                    __statement_ReAVeu(12);
                    var parsedJSONML = [], parser = new Parser({
                            start: function (tag) {
                                __block_Qqs4PT(3);
                                {
                                    __statement_ReAVeu(13);
                                    __extro_agqCI4(14, __intro_Eakd1U(14, parsedJSONML).push(tag));
                                }
                            },
                            content: function (text) {
                                __block_Qqs4PT(4);
                                {
                                    __statement_ReAVeu(15);
                                    __extro_agqCI4(16, __intro_Eakd1U(16, parsedJSONML).push(text));
                                }
                            },
                            end: function (tag) {
                                __block_Qqs4PT(5);
                                {
                                    __statement_ReAVeu(17);
                                    __extro_agqCI4(18, __intro_Eakd1U(18, parsedJSONML).push(tag));
                                }
                            },
                            done: function () {
                                __block_Qqs4PT(6);
                            }
                        }), jsonml = [
                            'p',
                            {
                                'class': 'something'
                            },
                            'text'
                        ], nestedJsonml = [
                            'p',
                            {
                                'class': 'something'
                            },
                            [
                                'span',
                                'before'
                            ],
                            ' text ',
                            [
                                'span',
                                'after'
                            ]
                        ], voidJsonml = [
                            'p',
                            [
                                'img',
                                {
                                    src: 'asd'
                                }
                            ],
                            ' text ',
                            [
                                'br'
                            ],
                            ' after'
                        ], noParentJsonml = [
                            [
                                'div'
                            ],
                            [
                                'img',
                                {
                                    src: 'asd'
                                }
                            ],
                            [
                                'div'
                            ]
                        ];
                }
                {
                    __statement_ReAVeu(19);
                    __expression_mD6ERR(20), it('should call all events', function () {
                        __block_Qqs4PT(7);
                        {
                            __statement_ReAVeu(21);
                            __extro_agqCI4(22, __intro_Eakd1U(22, parser).parseJSONML(jsonml));
                        }
                        {
                            __statement_ReAVeu(23);
                            __extro_agqCI4(24, __intro_Eakd1U(24, assert).strictEqual(parsedJSONML.length, 3));
                        }
                    });
                }
                {
                    __statement_ReAVeu(25);
                    __expression_mD6ERR(26), it('should call all events for nested jsonml', function () {
                        __block_Qqs4PT(8);
                        {
                            __statement_ReAVeu(27);
                            parsedJSONML = [];
                        }
                        {
                            __statement_ReAVeu(28);
                            __extro_agqCI4(29, __intro_Eakd1U(29, parser).parseJSONML(nestedJsonml));
                        }
                        {
                            __statement_ReAVeu(30);
                            __extro_agqCI4(31, __intro_Eakd1U(31, assert).strictEqual(parsedJSONML.length, 9));
                        }
                    });
                }
                {
                    __statement_ReAVeu(32);
                    __expression_mD6ERR(33), it('should handle void and self closing tags', function () {
                        __block_Qqs4PT(9);
                        {
                            __statement_ReAVeu(34);
                            parsedJSONML = [];
                        }
                        {
                            __statement_ReAVeu(35);
                            __extro_agqCI4(36, __intro_Eakd1U(36, parser).parseJSONML(voidJsonml));
                        }
                        {
                            __statement_ReAVeu(37);
                            __extro_agqCI4(38, __intro_Eakd1U(38, assert).strictEqual(parsedJSONML[0].name, 'p'));
                        }
                    });
                }
                {
                    __statement_ReAVeu(39);
                    __expression_mD6ERR(40), it('should handle no parent element', function () {
                        __block_Qqs4PT(10);
                        {
                            __statement_ReAVeu(41);
                            parsedJSONML = [];
                        }
                        {
                            __statement_ReAVeu(42);
                            __extro_agqCI4(43, __intro_Eakd1U(43, parser).parseJSONML(noParentJsonml));
                        }
                        {
                            __statement_ReAVeu(44);
                            __extro_agqCI4(45, __intro_Eakd1U(45, assert).strictEqual(parsedJSONML[0].name, 'div'));
                        }
                    });
                }
            });
        }
        {
            __statement_ReAVeu(46);
            __expression_mD6ERR(47), describe('parseHTML(htmlString)', function () {
                __block_Qqs4PT(11);
                {
                    __statement_ReAVeu(48);
                    var parsedHTML = [], parser = new Parser({
                            start: function (tag) {
                                __block_Qqs4PT(12);
                                {
                                    __statement_ReAVeu(49);
                                    __extro_agqCI4(50, __intro_Eakd1U(50, parsedHTML).push(tag));
                                }
                            },
                            content: function (text) {
                                __block_Qqs4PT(13);
                                {
                                    __statement_ReAVeu(51);
                                    __extro_agqCI4(52, __intro_Eakd1U(52, parsedHTML).push(text));
                                }
                            },
                            end: function (tag) {
                                __block_Qqs4PT(14);
                                {
                                    __statement_ReAVeu(53);
                                    __extro_agqCI4(54, __intro_Eakd1U(54, parsedHTML).push(tag));
                                }
                            },
                            done: function () {
                                __block_Qqs4PT(15);
                            }
                        }), html = '<p class="something" empty-attribute empty>text</p>', singleQuoteHtml = '<p class=\'something\'></p>', nestedHtml = '<p class="something"><span>before</span> text <span>after</span></p>', voidHtml = '<p><img src="asd"> text <br/> after</p>';
                }
                {
                    __statement_ReAVeu(55);
                    __expression_mD6ERR(56), it('should call all events', function () {
                        __block_Qqs4PT(16);
                        {
                            __statement_ReAVeu(57);
                            __extro_agqCI4(58, __intro_Eakd1U(58, parser).parseHTML(html));
                        }
                        {
                            __statement_ReAVeu(59);
                            __extro_agqCI4(60, __intro_Eakd1U(60, assert).strictEqual(parsedHTML.length, 3));
                        }
                    });
                }
                {
                    __statement_ReAVeu(61);
                    __expression_mD6ERR(62), it('should pass correct values', function () {
                        __block_Qqs4PT(17);
                        {
                            __statement_ReAVeu(63);
                            __extro_agqCI4(64, __intro_Eakd1U(64, assert).strictEqual(parsedHTML[0].name, 'p'));
                        }
                        {
                            __statement_ReAVeu(65);
                            __extro_agqCI4(66, __intro_Eakd1U(66, assert).notStrictEqual((__expression_mD6ERR(67), typeof parsedHTML[0].attributes), 'undefined'));
                        }
                        {
                            __statement_ReAVeu(68);
                            __extro_agqCI4(69, __intro_Eakd1U(69, assert).strictEqual(parsedHTML[1], 'text'));
                        }
                        {
                            __statement_ReAVeu(70);
                            __extro_agqCI4(71, __intro_Eakd1U(71, assert).strictEqual(parsedHTML[2].name, 'p'));
                        }
                        {
                            __statement_ReAVeu(72);
                            __extro_agqCI4(73, __intro_Eakd1U(73, assert).strictEqual((__expression_mD6ERR(74), typeof parsedHTML[2].attributes), 'undefined'));
                        }
                    });
                }
                {
                    __statement_ReAVeu(75);
                    __expression_mD6ERR(76), it('should handle single quoted attributes', function () {
                        __block_Qqs4PT(18);
                        {
                            __statement_ReAVeu(77);
                            parsedHTML = [];
                        }
                        {
                            __statement_ReAVeu(78);
                            __extro_agqCI4(79, __intro_Eakd1U(79, parser).parseHTML(singleQuoteHtml));
                        }
                        {
                            __statement_ReAVeu(80);
                            __extro_agqCI4(81, __intro_Eakd1U(81, assert).strictEqual(parsedHTML[0].name, 'p'));
                        }
                        {
                            __statement_ReAVeu(82);
                            __extro_agqCI4(83, __intro_Eakd1U(83, assert).notStrictEqual((__expression_mD6ERR(84), typeof parsedHTML[0].attributes), 'undefined'));
                        }
                        {
                            __statement_ReAVeu(85);
                            __extro_agqCI4(86, __intro_Eakd1U(86, assert).strictEqual(parsedHTML[0].attributes.class, 'something'));
                        }
                    });
                }
                {
                    __statement_ReAVeu(87);
                    __expression_mD6ERR(88), it('should handle void and self closing tags', function () {
                        __block_Qqs4PT(19);
                        {
                            __statement_ReAVeu(89);
                            parsedHTML = [];
                        }
                        {
                            __statement_ReAVeu(90);
                            __extro_agqCI4(91, __intro_Eakd1U(91, parser).parseHTML(voidHtml));
                        }
                        {
                            __statement_ReAVeu(92);
                            __extro_agqCI4(93, __intro_Eakd1U(93, assert).strictEqual(parsedHTML[0].name, 'p'));
                        }
                    });
                }
                {
                    __statement_ReAVeu(94);
                    __expression_mD6ERR(95), it('should call all events for nested html', function () {
                        __block_Qqs4PT(20);
                        {
                            __statement_ReAVeu(96);
                            parsedHTML = [];
                        }
                        {
                            __statement_ReAVeu(97);
                            __extro_agqCI4(98, __intro_Eakd1U(98, parser).parseHTML(nestedHtml));
                        }
                        {
                            __statement_ReAVeu(99);
                            __extro_agqCI4(100, __intro_Eakd1U(100, assert).strictEqual(parsedHTML.length, 9));
                        }
                    });
                }
            });
        }
    });
}