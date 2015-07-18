var windsock = require('../src/index'),
    Node = require('../src/node/node'),
    Element = require('../src/node/element'),
    assert = require('assert');

describe('Element', function () {

    var parsed, compiled, compiledHTML, html = '<li></li><li class></li><li class=""></li><li class="asd"></li>'

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Element, 'undefined');

    });

    describe('element.class', function(){

        parsed = windsock.parse(html);

        it('should return an empty array', function(){

            var cls = parsed.children[0].class;
            assert.strictEqual(cls.length, 0);

        });

        it('should return an empty array', function(){

            var cls = parsed.children[1].class;
            assert.strictEqual(cls.length, 0);

        });

        it('should return an array containing class', function(){

            var cls = parsed.children[3].class;
            assert.strictEqual(cls.length, 1);
            assert.strictEqual(cls[0], 'asd');

        });

    });

});
