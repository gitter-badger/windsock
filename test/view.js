var View = require('../src/view');
var assert = require('assert');

describe('View', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof View, 'undefined');

    });

    describe('View.node()', function(){

        it('should throw an error if node name not provided', function(){

            var thrown = false;

            try{

                var node = View.node();

            }catch(e){

                thrown = true;

            }

            assert.strictEqual(thrown, true);

        });

        it('should return an object with accessor keys', function(){

            var keys = ['name', 'attributes', 'children'],
                node = View.node('div');

            keys.forEach(function(key){

                assert.strictEqual(node.hasOwnProperty(key), true);

            });

        });

        describe('node.name',function(){

            it('should return the name as a string', function(){

                var node = View.node('div');

                assert.strictEqual(node.name, 'div');
                assert.strictEqual(Object.prototype.toString.call(node.name), '[object String]');

            });

            it('should set the value at index 0', function(){

                var node = View.node('div');

                assert.strictEqual(node[0], 'div');

            });

            it('should change property value and value index 0', function(){

                var node = View.node('div');

                node.name = 'a';
                assert.strictEqual(node.name, 'a');
                assert.strictEqual(node[0], 'a');

            });

        });

        describe('node.attributes',function(){

            it('should return an empty object for attributes that do not exist', function(){

                var node = View.node('div');
                assert.strictEqual(Object.keys(node.attributes).length, 0);

            });

            it('should set the value at index 1', function(){

                var node = View.node('div');

                node.attributes.add('class', 'myClass');
                assert.strictEqual(node[1].class, 'myClass');

            });

            it('should change property value and value index 1', function(){

                var node = View.node('div');

                node.attributes = {class: 'myClass'};
                node.attributes.add('id', 'myId');
                assert.strictEqual(node[1].id, 'myId');
                assert.strictEqual(node.attributes.id, 'myId');

            });

            it('should set properties and perserve observers', function(){

                var node = View.node('div'),
                    count = 0;

                node.attributes.watch(function(){
                    count++;
                });

                node.attributes.add('class', 'myClass');
                node.attributes.class = 'newClass';

                assert.strictEqual(count, 2);

            });

            it('should insert values at index 1 when children exist', function(){

                var node = View.node('div');

                node.children.push('textnode', ' textnode');
                node.attributes.add('class', 'myClass');
                assert.strictEqual(node[1].class, 'myClass');
                assert.strictEqual(node.length, 4);

            });

        });

        describe('node.children',function(){

            it('should have length of 0 if no children', function(){

                var node = View.node('div');

                assert.strictEqual(node.children.length, 0);

            });

            it('should have length of 0 if no children and attributes', function(){

                var node = View.node('div');

                node.attributes = {class: 'myClass'};
                assert.strictEqual(node.children.length, 0);

            });

            it('should have correct length with just node name', function(){

                var node = View.node('div');

                node.children.push('text', ['div']);
                assert.strictEqual(node.children.length, 2);
                assert.strictEqual(node[1], 'text');

            });

            it('should have correct length with attributes', function(){

                var node = View.node('div');

                node.attributes.add('class', 'myClass');
                node.children.push('text', ['div']);
                assert.strictEqual(node.children.length, 2);
                assert.strictEqual(node[2], 'text');

            });

        });

    });

    describe('View.fragment()', function(){

        it('should ', function(){



        });

        describe('fragment.append',function(){



        });

        describe('fragment.prepend',function(){



        });

    });

});
