var windsock = require('../src/index'),
    Node = require('../src/node/node'),
    assert = require('assert');

describe('windsock', function () {

    var parsed, compiled, compiledHTML, html = '<ul><li content-editable><p class="paragraph">new<br/>line</p><input type="text"/></li></ul>'

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof windsock, 'undefined');

    });

    describe('windsock.parse', function(){

        it('should return an instance of Node', function(){

            parsed = windsock.parse(html);
            assert.strictEqual(parsed instanceof Node, true);

        });

    });

    describe('windsock.compile', function(){

        it('should return a deep clone', function(){

            compiled = windsock.compile(parsed);
            assert.notStrictEqual(compiled, parsed);

        });

    });

    describe('node.html', function(){

        it('should return same string value', function(){

            compiledHTML = compiled.children[0].html;

            assert.strictEqual(compiledHTML, html);

        });

    });

});
