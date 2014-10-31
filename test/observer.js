var Observer = require('../src/observer'),
    assert = require('assert');

describe('Observer', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Observer, 'undefined');

    });

    describe('observe(obj)', function(){

        var mockObject = {
                hello: 'world',
                nested: {
                    obj: 'ect'
                },
                nest:['ed array']
            },
            observed = Observer.observe(mockObject);

        it('should not modify object', function () {

            var keys = Object.keys(mockObject),
                mockKeys = ['hello', 'nested', 'nest'];

            assert.strictEqual(keys.length, mockKeys.length);

            keys.forEach(function(key){

                assert.notStrictEqual(mockKeys.indexOf(key), -1);

            });

        });

        it('should return an observable object with same values', function () {

            var keys = Object.keys(mockObject)

            keys.forEach(function(key){

                if(typeof mockObject[key] == 'object'){

                    var k = Object.keys(mockObject[key]);

                    k.forEach(function(ey){

                        assert.equal(mockObject[key][ey], observed[key][ey]);

                    });

                }else{

                    assert.equal(mockObject[key], observed[key]);

                }

            });

        });

        it('should add mutation methods', function () {

            var methods = ['add', 'remove', '_observers'];

            methods.forEach(function(key){

                assert.notStrictEqual(typeof observed[key], 'undefined');

            });

        });

        it('should make nested objects and arrays observable', function(){

            var methods = ['add', 'remove', '_observers'],
                keys = Object.keys(observed);

            keys.forEach(function(key){

                if(typeof observed[key] == 'object'){

                    methods.forEach(function(method){

                        assert.notStrictEqual(typeof observed[key][method], 'undefined');

                    });

                }

            });

        });

        describe('add(key, value)', function(){

            observed.add('foo', 'bar');
            assert.strictEqual(observed.foo, 'bar');

        });

        describe('remove(key)', function(){

            //observed.remove('foo');
            //assert.strictEqual(typeof observed.foo, 'undefined');

        });

    });

    describe('observe(arr)', function () {

        var mockArray = ['cat', 'dog', {nested:'object'}, ['nested array']],
            observed = Observer.observe(mockArray);

        it('should not modify array', function () {

            var keys = Object.keys(mockArray);
            assert.strictEqual(mockArray.length, 4);
            assert.strictEqual(keys.length, 4);

        });

        it('should return an observable array with same values', function () {

            var keys = Object.keys(mockArray)

            keys.forEach(function(key){

                if(typeof mockArray[key] == 'object'){

                    var k = Object.keys(mockArray[key]);

                    k.forEach(function(ey){

                        assert.equal(mockArray[key][ey], observed[key][ey]);

                    });

                }else{

                    assert.equal(mockArray[key], observed[key]);

                }

            });

        });

        it('should add mutation methods', function () {

            var methods = ['add', 'remove', '_observers'];

            methods.forEach(function(key){

                assert.notStrictEqual(typeof observed[key], 'undefined');

            });

        });

        it('should make nested objects and arrays observable', function(){

            var methods = ['add', 'remove', '_observers'],
                keys = Object.keys(observed);

            keys.forEach(function(key){

                if(typeof observed[key] == 'object'){

                    methods.forEach(function(method){

                        assert.notStrictEqual(typeof observed[key][method], 'undefined');

                    });

                }

            });

        });

    });

});
