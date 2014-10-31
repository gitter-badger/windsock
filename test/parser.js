var Parser = require('../src/parser'),
    assert = require('assert');

describe('Parser', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Parser, 'undefined');

    });

    describe('parseJSONML(jsonmlObject)', function(){

        var parsedJSONML = [],
            parser = new Parser({

                start:function(tag){

                    parsedJSONML.push(tag);

                },

                content:function(text){

                    parsedJSONML.push(text);

                },

                end:function(tag){

                    parsedJSONML.push(tag);

                },

                done:function(){

                }
            }),
            jsonml = ['p', {'class':'something'}, 'text'],
            nestedJsonml = ['p', {'class':'something'}, ['span', 'before'], ' text ', ['span', 'after']],
            voidJsonml = ['p', ['img', {src:'asd'}], ' text ', ['br'], ' after'],
            noParentJsonml = [['div'],['img', {src:'asd'}],['div']];

            it('should call all events', function(){

                parser.parseJSONML(jsonml);
                assert.strictEqual(parsedJSONML.length, 3);

            });

            it('should call all events for nested jsonml', function(){

                parsedJSONML = [];
                parser.parseJSONML(nestedJsonml);
                assert.strictEqual(parsedJSONML.length, 9);

            });

            it('should handle void and self closing tags', function(){

                parsedJSONML = [];
                parser.parseJSONML(voidJsonml);
                assert.strictEqual(parsedJSONML[0].name, 'p');

            });

            it('should handle no parent element', function(){

                parsedJSONML = [];
                parser.parseJSONML(noParentJsonml);
                assert.strictEqual(parsedJSONML[0].name, 'div');

            });

    });

    describe('parseHTML(htmlString)', function(){

        var parsedHTML = [],
            parser = new Parser({

                start:function(tag){

                    parsedHTML.push(tag);

                },

                content:function(text){

                    parsedHTML.push(text);

                },

                end:function(tag){

                    parsedHTML.push(tag);

                },

                done:function(){

                }
            }),
            html = '<p class="something" empty-attribute empty>text</p>',
            singleQuoteHtml = "<p class='something'></p>",
            nestedHtml = '<p class="something"><span>before</span> text <span>after</span></p>',
            voidHtml = '<p><img src="asd"> text <br/> after</p>';

        it('should call all events', function(){

            parser.parseHTML(html);
            assert.strictEqual(parsedHTML.length, 3);

        });

        it('should pass correct values', function(){

            assert.strictEqual(parsedHTML[0].name, 'p');
            assert.notStrictEqual(typeof parsedHTML[0].attributes, 'undefined');
            assert.strictEqual(parsedHTML[1], 'text');
            assert.strictEqual(parsedHTML[2].name, 'p');
            assert.strictEqual(typeof parsedHTML[2].attributes, 'undefined');

        });

        it('should handle single quoted attributes', function(){

            parsedHTML = [];
            parser.parseHTML(singleQuoteHtml);
            assert.strictEqual(parsedHTML[0].name, 'p');
            assert.notStrictEqual(typeof parsedHTML[0].attributes, 'undefined');
            assert.strictEqual(parsedHTML[0].attributes.class, 'something');

        });

        it('should handle void and self closing tags', function(){

            parsedHTML = [];
            parser.parseHTML(voidHtml);
            assert.strictEqual(parsedHTML[0].name, 'p');

        });

        it('should call all events for nested html', function(){

            parsedHTML = [];
            parser.parseHTML(nestedHtml);
            assert.strictEqual(parsedHTML.length, 9);

        });

    });

});
