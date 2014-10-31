var util = require('./util'),
    Signals = require('./signals'),
    is = util.is,
    bind = util.bind,
    each = util.each,
    extend = util.extend;

function accessors(value, obj){
    return {
        get: function(){
            return value;
        },
        set: function(val){

            if(is(val, 'array') || is(val, 'object')){

                val = Observer.observe(val);

            }

            value = val;
            //console.log('mutated');
            obj._observers.dispatch(mutation({
                method: 'set',
                value: value
            }));
        },
        enumerable:true
    };
}

function mutation(obj){
    return extend(Object.create(null, {
        method:{
            value:null,
            writable:true,
            enumerable:true
        },
        value:{
            value: null,
            writable:true,
            enumerable:true
        }
    }), obj);
}

function Observer(){}

Observer.prototype = {};

Observer.observable = function(obj){

    Object.defineProperties(obj, {

        add: {

            value: bind(function(key, value){

                value = value || key;

                if(is(value, 'array') || is(value, 'object')){

                    value = Observer.observe(value);

                }

                if(is(this, 'array')){
                    //key is value for arrays
                    Object.defineProperty(this, this.length - 1, accessors(value, this));
                    this.push(value);

                }else{

                    Object.defineProperty(this, key, accessors(value, this));

                }

                this._observers.dispatch(mutation({
                    method: 'add',
                    value: value
                }));

            }, obj),

            enumerable:false

        },

        remove:{

            value: bind(function(key){

                var removed;

                if(typeof this[key] !== 'undefined'){

                    removed = this[key];

                    if(is(this, 'array')){

                        this.splice(key, 1);

                    }else{
                        //console.log('here');
                        //console.log(this[key]);
                        delete this[key];

                    }

                    this._observers.dispatch(mutation({
                        method: 'remove',
                        value: value
                    }));

                }

            }, obj),

            enumerable:false

        },

        _observers: {
            value: new Signals(),
            enumerable: false
        }

    });

    return obj;

};

Observer.observe = function(obj){

    var object;

    if(is(obj, 'object')){

        object = Observer.observable(Object.create(Object.prototype));

    }else if(is(obj, 'array')){

        object = Observer.observable(Object.create(Array.prototype));

    }else{

        throw new Error('param is not of type Object or Array');

    }

    each(obj, function(value, key){

        object.add(key, value);

    });

    return object;

};

module.exports = Observer;
