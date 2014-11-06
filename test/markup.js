var Markup = require('../src/markup');
var assert = require('assert');

describe('Markup', function () {

    it('should be loaded successfully', function () {

        assert.notStrictEqual(typeof Markup, 'undefined');

    });

    describe('Markup.node()', function(){

        it('should throw an error if node name not provided', function(){

            var thrown = false;

            try{

                var node = Markup.node();

            }catch(e){

                thrown = true;

            }

            assert.strictEqual(thrown, true);

        });

        it('should return an object with accessor keys', function(){

            var keys = ['name', 'attributes', 'children'],
                node = Markup.node('div');

            keys.forEach(function(key){

                assert.strictEqual(node.hasOwnProperty(key), true);

            });

        });

        describe('node.name',function(){

            it('should return the name as a string', function(){

                var node = Markup.node('div');

                assert.strictEqual(node.name, 'div');
                assert.strictEqual(Object.prototype.toString.call(node.name), '[object String]');

            });

            it('should set the value at index 0', function(){

                var node = Markup.node('div');

                assert.strictEqual(node[0], 'div');

            });

            it('should change property value and value index 0', function(){

                var node = Markup.node('div');

                node.name = 'a';
                assert.strictEqual(node.name, 'a');
                assert.strictEqual(node[0], 'a');

            });

        });

        describe('node.attributes',function(){

            it('should return undefined for attributes that do not exist', function(){

                var node = Markup.node('div');
                assert.strictEqual(typeof node.attributes, 'undefined');

            });

            it('should set the value at index 1', function(){

                var node = Markup.node('div');

                node.attributes = {class: 'myClass'};
                assert.strictEqual(node[1].class, 'myClass');

            });

            it('should change property value and value index 1', function(){

                var node = Markup.node('div');

                node.attributes = {class: 'myClass'};
                node.attributes.add('id', 'myId');
                assert.strictEqual(node[1].id, 'myId');
                assert.strictEqual(node.attributes.id, 'myId');

            });

            it('should replace properties and perserve observers', function(){

                var node = Markup.node('div'),
                    count = 0;

                node.attributes = {class: 'myClass'};

                node.attributes.watch(function(){
                    count++;
                });

                node.attributes = {class: 'newClass'};
                assert.strictEqual(count, 2);

            });

            it('should insert values at index 1 when children exist', function(){

                var node = Markup.node('div');

                node.children = ['textnode', ' textnode'];
                node.attributes = {class: 'newClass'};
                assert.strictEqual(node[1].class, 'newClass');
                assert.strictEqual(node.length, 4);

            });

        });

        describe('node.children',function(){

            it('should have length of 0 if no children', function(){

                var node = Markup.node('div');

                assert.strictEqual(node.children.length, 0);

            });

            it('should have length of 0 if no children and attributes', function(){

                var node = Markup.node('div');

                node.attributes = {class: 'myClass'};
                assert.strictEqual(node.children.length, 0);

            });

            it('should have correct length with just node name', function(){

                var node = Markup.node('div'),
                    children = ['text', ['div']];

                node.children = children;
                assert.strictEqual(node.children.length, children.length);
                assert.strictEqual(node[1], 'text');

            });

            it('should have correct length with attributes', function(){

                var node = Markup.node('div'),
                    children = ['text', ['div']];

                node.attributes = {class: 'myClass'};
                node.children = children;
                assert.strictEqual(node.children.length, children.length);
                assert.strictEqual(node[2], 'text');

            });

        });

    });

    describe('Markup.fragment()', function(){

        it('should ', function(){



        });

        describe('fragment.append',function(){



        });

        describe('fragment.prepend',function(){



        });

    });

    it('should return an object with all methods', function(){

        //markup is an subclassed observed array

        //properties --
        //markup.attributes is an empty observed object - cant add attributes without name
        //markup.attributes.add()
        //markup.attributes.remove()
        //markup.attributes.class = ''
        //markup.name is an observed string
        //markup.name = 'div' <- unshift
        //markup.name = '' <- shift
        //markup.children is an observed array
        //markup.children.push()
        //markup.children.pop()

        //methods --
        //markup.parse() is a method that converts the param to values, clears observers and overwrites current values
        //markup.find() traverses and returns flat list(array) of markup objects that match

        //array values --
        //markup[0] = name or markup object
        //markup[1] = attributes or markup object
        //markup[2] = string
        //markup[0].set('div') -> must use set if exists
        //markup[1].set({} || markupObject || string) -> must use set if exists
        //markup[2].set()

        //mutation methods --
        //markup.push()
        //markup.splice()
        //markup.pop()


    });

});
