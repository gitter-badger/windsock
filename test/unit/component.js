import Component from '../../src/component';
import assert from 'assert';

describe('Component', ()=>{
    it('should be loaded successfully', function () {
        assert.notStrictEqual(typeof Component, 'undefined');
    });
    describe('instance', ()=>{
        it('should instantiate', ()=>{
            let component = new Component();
            assert.strictEqual(component instanceof  Component, true);
        });
    });
});