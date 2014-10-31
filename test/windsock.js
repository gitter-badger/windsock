var Windsock = require('../src/windsock');
var assert = require('assert');

describe('Windsock', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Windsock, 'undefined');

    });

    it('should do this', function(){

        var windsock = new Windsock({
            markup: '<p>some text</p>',
            data: {
                other:'text'
            }
        });



    });

});
