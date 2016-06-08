import Element from '../../src/vdom/element';
import assert from 'assert';

const className = 'name';

describe('Element', ()=>{
    it('should be loaded successfully', function () {
        assert.notStrictEqual(typeof Element, 'undefined');
    });
    describe('element.class', ()=>{
        describe('element.class.index', ()=>{
            it('should return -1 if class is undefined', ()=>{
                let element = new Element('span', {});
                assert.strictEqual(element.class.index(className), -1);
            });
            it('should return -1 if class is null', ()=>{
                let element = new Element('span', {class:null});
                assert.strictEqual(element.class.index(className), -1);
            });
            it('should return -1 if class is empty', ()=>{
                let element = new Element('span', {class: ''});
                assert.strictEqual(element.class.index(className), -1);
            });
            it('should return 0 if class exists', ()=>{
                let element = new Element('span', {class: className});
                assert.strictEqual(element.class.index(className), 0);
            });
            it('should throw an error on invalid classname', ()=>{
                let invalid = 'one two';
                let element = new Element('span', {});
                assert.throws(()=>{
                    element.class.index(invalid);
                }, Error, `Invalid classname '${invalid}' passed to index method`);
            });
        });
        describe('element.class.contains', ()=>{
            it('should return false if class is undefined', ()=>{
                let element = new Element('span', {});
                assert.strictEqual(element.class.contains(className), false);
            });
            it('should return false if class is null', ()=>{
                let element = new Element('span', {class:null});
                assert.strictEqual(element.class.contains(className), false);
            });
            it('should return false if class is empty', ()=>{
                let element = new Element('span', {class: ''});
                assert.strictEqual(element.class.contains(className), false);
            });
            it('should return true if class exists', ()=>{
                let element = new Element('span', {class: className});
                assert.strictEqual(element.class.contains(className), true);
            });
            it('should throw an error on invalid classname', ()=>{
                let invalid = 'one two';
                let element = new Element('span', {});
                assert.throws(()=>{
                    element.class.contains(invalid);
                }, Error, `Invalid classname '${invalid}' passed to contains method`);
            });
        });
        describe('element.class.remove', ()=>{
            it('should remain undefined if class is undefined', ()=>{
                let element = new Element('span', {});
                element.class.remove(className);
                assert.strictEqual(element.attributes.class, undefined);
            });
            it('should remain null if class is null', ()=>{
                let element = new Element('span', {class:null});
                element.class.remove(className);
                assert.strictEqual(element.attributes.class, null);
            });
            it('should remain empty if class is empty', ()=>{
                let element = new Element('span', {class:''});
                element.class.remove(className);
                assert.strictEqual(element.attributes.class, '');
            });
            it('should remove class and set to empty', ()=>{
                let element = new Element('span', {class:className});
                element.class.remove(className);
                assert.strictEqual(element.attributes.class, '');
            });
            it('should remove class and leading whitespace', ()=>{
                let classList = `one ${className} three`;
                let element = new Element('span', {class:classList});
                element.class.remove(className);
                assert.strictEqual(element.attributes.class, 'one three');
            });
            it('should remove class and trailing whitespace', ()=>{
                let classList = `${className} one three`;
                let element = new Element('span', {class:classList});
                element.class.remove(className);
                assert.strictEqual(element.attributes.class, 'one three');
            });
            it('should throw an error on invalid classname', ()=>{
                let classList = 'one two three',
                    invalid = 'one two';
                let element = new Element('span', {class:classList});
                assert.throws(()=>{
                    element.class.remove(invalid);
                }, Error, `Invalid classname '${invalid}' passed to remove method`);
            });
        });
        describe('element.class.add', ()=>{
            it('should set class when undefined', ()=>{
                let element = new Element('span', {});
                element.class.add(className);
                assert.strictEqual(element.attributes.class, className);
            });
            it('should set class when null', ()=>{
                let element = new Element('span', {class:null});
                element.class.add(className);
                assert.strictEqual(element.attributes.class, className);
            });
            it('should set class when empty', ()=>{
                let element = new Element('span', {class:''});
                element.class.add(className);
                assert.strictEqual(element.attributes.class, className);
            });
            it('should not add class when exists', ()=>{
                let element = new Element('span', {class:className});
                element.class.add(className);
                assert.strictEqual(element.attributes.class, className);
            });
            it('should append to class list', ()=>{
                let classList = 'one two';
                let element = new Element('span', {class:classList});
                element.class.add(className);
                assert.strictEqual(element.attributes.class, `${classList} ${className}`);
            });
            it('should throw an error on invalid classname', ()=>{
                let classList = 'three',
                    invalid = 'one two';
                let element = new Element('span', {class:classList});
                assert.throws(()=>{
                    element.class.add(invalid);
                }, Error, `Invalid classname '${invalid}' passed to add method`);
            });
        });
    });
});
