(function(){

    'use strict';

    var Signals = require('../src/signals'),
        assert = require('assert');

    describe('signal', function(){

        var flare = new Signals.Signal();

        describe('#signal', function(){

            it('should return a function', function(){

                assert.equal(typeof flare, 'object');

            });

        });
    });

})();
