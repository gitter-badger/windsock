import * as router from '../../src/router';
import assert from 'assert';

describe('router', ()=>{
    describe('register', ()=>{
        it('should be defined', ()=>{
            assert.notStrictEqual(typeof router.register, 'undefined');
        });
        it('should be a function', ()=>{
            assert.strictEqual(typeof router.register, 'function');
        });
        it('should require 2 arguments',()=>{
            assert.strictEqual(router.register.length, 2);
        });
        it('should throw an error for invalid path', ()=>{
            assert.throws(()=>{
                router.register('/');
            }, Error, 'invalid path');
        });
        it('should throw an error if state config is not an object', ()=>{
            assert.throws(()=>{
                router.register('', true);
            }, Error, 'parameter must be an object');
        });
        it('should register a state config at the root state', ()=>{
            let config = {},
                state = router.register('', config);
            assert.strictEqual(state.length, 1);
            assert.strictEqual(state[0], config);
        });
    });
    describe('go', ()=>{
        it('should be defined', ()=>{
            assert.notStrictEqual(typeof router.go, 'undefined');
        });
        it('should be a function', ()=>{
            assert.strictEqual(typeof router.go, 'function');
        });
        it('should require 1 argument',()=>{
            assert.strictEqual(router.go.length, 1);
        });
    });
    describe('start', ()=>{
        it('should be defined', ()=>{
            assert.notStrictEqual(typeof router.start, 'undefined');
        });
        it('should be a function', ()=>{
            assert.strictEqual(typeof router.start, 'function');
        });
        it('should require 0 arguments',()=>{
            assert.strictEqual(router.start.length, 0);
        });
        it('should start the router',()=>{
            router.start();
        });
    });
});