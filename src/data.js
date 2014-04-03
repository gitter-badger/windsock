(function(){

    'use strict';

    var util = require('./util'),
        Signals = require('./signals'),
        is = util.is,
        set = util.set,
        extend = util.extend,
        traverse = util.traverse,
        each = util.each;

    function Observer(fn){

        var observer = new Signals.Signal.extend({

            context: null,

            _signal: function(){

                fn.apply(this.context, arguments);

            }

        });

        return new observer();

    }

    //subject is a simple signal wrapper
    function Subject(obj){

        extend(this, obj);

        this.observers = new Signals({async:false, flowing:true});

    }

    Subject.prototype.add = function(observer){

        observer.context = this;

        this.observers.add(observer);

    };

    Subject.prototype.list = function(){

        return this.observers._callbacks;

    };

    Subject.prototype.remove = function(observer){

        this.observers.remove(observer);

    };

    Subject.prototype.emit = function(){

        //applying a context to a signal gets overridden
        this.observers.apply(undefined, arguments);

    }

    Data.Observer = Observer;
    Data.Subject = Subject;

    //blegh this isn't working
    Data.mutate = function(obj, key, fn){

        if(!obj._observable) throw new Error('Object is non mutatable. Missing observers.');

        //return by key/index if removed on object/array so we can clean up
        //instead of manually cleaning this up we could do a traversal and compare...
        var removeKey = fn(obj[key]);
        obj[key] = {asd:'asd'};
        console.log(obj[key].prop);

        if(removeKey) {
            //remove all observers
            obj[key]._observable[removeKey].remove();
            //set subject to undefined
            obj[key]._observable[removeKey] = undefined;
        }

        Data(obj[key]);

        obj._observable[key].emit('mutate', key, obj);
        //obj._observable._parent.emit('mutate', key);

    };

    Data.observe = function(obj, key, fn){

        if(!obj._observable || !obj._observable[key]) throw new Error('Observable key "' + key + '" does not exist');

        obj._observable[key].add(new Observer(fn));
        //obj._observable._parent.add(new Observer(fn));

    };

    Data.proxy = function(proxy, obj, alias){

        //create an observable object
        Data(obj);

        //create proxy accessors for literals only
        each(obj, function(value, key){

            var aliasKey = key;

            //optionally alias proxied key with another
            if(alias && alias[key]) aliasKey = alias[key];

            set(proxy, aliasKey, {

                set: function(v){

                    obj[key] = v;

                },

                get: function(){

                    return obj[key];

                }

            });

        });

    };

    //observable model
    //todo offer optional bubbling to parent
    function Data(obj){

        traverse(obj, function(){

            //var args = util.orderEach.apply(undefined, arguments);

            var parent = arguments[2],
                prop = arguments[1],
                value = arguments[0],
                observers = [];

            // if(is(parent, 'array')){

            //     prop = arguments[1];
            //     value = arguments[0];

            // }

            //check if parent already has an _observable prop
            if(!parent._observable){
                set(parent, {
                    _observable: {
                        writable: true,
                        enumerable: false,
                        value: Object.create(null)
                    }
                });
            }

            //already have existing observers
            if(parent._observable[prop]) {

                observers = observers.concat(parent._observable[prop].list());
                //console.log(observers.length);
            }

            //for each prop on parent set value
            set(parent._observable, prop, {
                writable: true,
                enumerable: true,
                value: new Subject({
                    value: value,
                    parent: parent
                })
            });


            //!reserved word _parent, DO NOT USE OMG
            // if(!parent._observable._parent){
            //     set(parent._observable, '_parent', {
            //         writable: true,
            //         enumerable: false,
            //         value: new Subject({
            //             self: parent
            //         })
            //     });
            // }

            //var observer = new Observer(function(method, property, parentObj){});

            //if(!observers.length) observers.push(observer);
            //parent._observable[prop].add(observer);

            each(observers, function(obv){
                parent._observable[prop].add(obv);
            });

            //because target exists we reset the propertiy value to a descriptor with accessors
            set(parent, prop, {

                set:function(v){

                    if(is(v, 'array') || is(v, 'object')) Data(v);

                    parent._observable[prop].value = v;

                    //emit for listeners on prop
                    parent._observable[prop].emit('set', prop, parent);
                    //parent._observable._parent.emit('set', prop, v);

                },

                get: function(){

                    parent._observable[prop].emit('get', prop, parent);

                    return parent._observable[prop].value;

                }

            });

        });

        return obj;

    }

    module.exports = Data;

})();
