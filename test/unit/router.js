import * as router from '../../src/router';
import assert from 'assert';

describe('router', ()=>{
    describe('reset', ()=>{
        it('should be defined', ()=>{
            assert.notStrictEqual(typeof router.reset, 'undefined');
        });
        it('should be a function', ()=>{
            assert.strictEqual(typeof router.reset, 'function');
        });
        it('should require 0 arguments',()=>{
            assert.strictEqual(router.reset.length, 0);
        });
        it('should reset router',()=>{
            router.reset();
        });
    });
    describe('register', ()=>{
        it('should be defined', ()=>{
            assert.notStrictEqual(typeof router.register, 'undefined');
        });
        it('should be a function', ()=>{
            assert.strictEqual(typeof router.register, 'function');
        });
        it('should require 1 arguments',()=>{
            assert.strictEqual(router.register.length, 1);
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
        it('should throw an error for invalid path', ()=>{
            assert.throws(()=>{
                router.go('/');
            }, Error, 'Invalid path format');
        });
        it('should throw an error for invalid params', ()=>{
            let segmentTemplate = 'oreo';
            assert.throws(()=>{
                router.go(`cat/:${segmentTemplate}`);
            }, Error, `Invalid params for path ${segmentTemplate}`);
        });
        describe('success', ()=>{
            let route = 'success',
                promise,
                request;
            before((done)=>{
                router.reset();
                router.register(route, {
                    activate: ()=>{
                        return Promise.resolve();
                    }
                });
                router.start();
                promise = router.go(route);
                promise.then((req)=>{
                    request = req;
                    done();
                });
            });
            it('should return a promise',()=>{
                assert.strictEqual(promise instanceof Promise, true);
            });
            it('should resolve a request',()=>{
                assert.strictEqual(request instanceof router.Request, true);
            });
        });
        describe('failure', ()=>{
            let route = 'fail',
                success = false,
                reason,
                promise;
            before((done)=>{
                router.reset();
                router.register(route, {
                    activate: ()=>{
                        return Promise.reject('failed');
                    }
                });
                router.start();
                promise = router.go(route);
                promise.then((r)=>{
                    success = true;
                    done();
                }, (r)=>{
                    reason = r;
                    done();
                });
            });
            it('should return a promise',()=>{
                assert.strictEqual(promise instanceof Promise, true);
            });
            it('should not resolve',()=>{
                assert.strictEqual(success, false);
            });
            it('should reject with reason',()=>{
                assert.strictEqual(reason, 'failed');
            });
        });
        describe('activate/ deactivate', ()=>{
            let routes = [
                    '',
                    'one',
                    'one/two',
                    'one/two/three'
                ],
                activated = [],
                deactivated = [],
                failed = false,
                activate = 0,
                promise;
            before((done)=>{
                failed = false;
                activate = 0;
                router.reset();
                routes.forEach(r => router.register(r, {
                    activate: (req)=>{
                        activated.push(req.target);
                    },
                    deactivate: (req)=>{
                        deactivated.push(req.target);
                    }
                }));
                router.start({
                    post: (req)=>{
                        if(req.resolved === routes[routes.length - 1]){
                            done();
                        }
                    }
                });
                promise = router.go(routes[routes.length - 1]);
                promise.then((r)=>{
                    activate = activate + 1;
                }, (r)=>{
                    failed = true;
                });
            });
            it('should not fail',()=>{
                assert.strictEqual(failed, false);
            });
            it('should activate each route in order',()=>{
                assert.strictEqual(activated.length, routes.length);
                activated.forEach((route, i)=>{
                    assert.strictEqual(route, routes[i]);
                });
            });
            it('should leave each state in order except root state',(done)=>{
                router.go('')
                    .then(()=>{
                        assert.strictEqual(deactivated.length, routes.length - 1);
                        deactivated.reverse().forEach((route, i)=>{
                            assert.strictEqual(route, routes[i+1]);
                        });
                        done();
                    });
            });
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
        describe('otherwise', ()=>{
            var request,
                activated,
                requested,
                route = 'one',
                doesNotExist = 'does-not-exist';
            before((done)=>{
                activated = 0;
                requested = '';
                router.reset();
                router.register(route);
                router.start({
                    otherwise: route,
                    post: (req)=>{
                        activated = activated + 1;
                        requested = req.requested;
                    }
                });
                router.go(doesNotExist)
                    .then((req)=>{
                        request = req;
                        done();
                    });
            });
            it('should activate otherwise state',()=>{
                assert.strictEqual(request.segments[1], route);
                assert.strictEqual(activated, 1);
                assert.strictEqual(requested, doesNotExist);
            });
        });
    });
});