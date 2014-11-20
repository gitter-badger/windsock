var tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : window.setTimeout,
    paint = (typeof window !== 'undefined' && window.requestAnimationFrame) ? window.requestAnimationFrame : tick;

var util = {

    nextTick: function(fn, context){

        //defer callback to nextTick in node.js otherwise setTimeout in the client
        return tick(util.bind(fn, context), 1);

    },

    nextPaint: function(fn, context){

        return paint(util.bind(fn, context), 1);

    },

    each:function(obj, fn){

        var halt = Object.create(null),
            keys;

        //duck typing ftw
        if(typeof obj.length === 'undefined'){

            keys = Object.keys(obj);

            for(var i = 0, l = keys.length; i < l; i++){

                if(fn.call(this, obj[keys[i]], keys[i], obj, halt) === halt) return;

            }

            return;

        }

        //cached length is faster
        for(var i = 0, l = obj.length; i < l; i++){

            if (fn.call(this, obj[i], i, obj, halt) === halt) return;

        }

    },

    //in order synchronous traversal
    traverse: function(list, fn){

        util.each.call(this, list, function(result){

            var halt;

            //invoke function on result first
            halt = fn.apply(this, Array.prototype.slice.call(arguments));

            //traverse results
            if(util.is(result, 'object') || util.is(result, 'array')){

                util.traverse.call(this, result, fn);

            }

            return halt;

        });

    },

    find: function(list, query){

        var assert = util.noop,
            result;

        if(util.is(query, 'function')){

            assert = function(){

                if(query.apply(undefined, Array.prototype.slice.call(arguments))){

                    result = arguments[2];
                    return arguments[3];

                }
            };

        }else{

            assert = function(value, key, obj, halt){

                var match = true;

                each(query, function(v, k){



                });

            };

        }

        util.each(list, assert);

        return result;

    },

    //adds enumerable properties to object, returns that object
    extend: function(obj){

        for(var i = 1, l = arguments.length; i < l; i++){

            if(arguments[i]) util.each(arguments[i], function(value, key){

                obj[key] = value;

            });

        }

        return obj;

    },

    //overwrites enumerable properties only if they exist
    //TODO: make this an option - only if they dont exist
    merge: function(obj){

        var args = Array.prototype.slice.call(arguments, 1);

        util.each(args, function mergeArgIterator(val, i){

            util.each(obj, function mergeTargetKeyIterator(value, key){

                if(typeof args[i][key] !== 'undefined') obj[key] = args[i][key];

            });

        });

        return obj;

    },

    //props is a object.defineProp descriptor
    inherit: function(construct, superConstruct, props){

        //Sets the prototype of the construct to a new object created from super.
        //Uses ECMAScript 5 Object.create
        if(construct.prototype && superConstruct.prototype){

            //Use carefully: v8 creates subclasses everytime the prototype is modified.
            construct.prototype = Object.create(superConstruct.prototype, props);
            construct.prototype.constructor = construct;

        }

        return construct;

    },

    match: function(list, query){

        var matched = true;

        util.each(query, function(val, key){

            if(list[key] !== val) matched = false;

        });

        return matched;

    },

    bind: function(fn, context){

        var args = Array.prototype.slice.call(arguments, 2);

        return function(){

            return fn.apply(context, args.concat(Array.prototype.slice.call(arguments)));

        };

    },

    is: function(obj, type){

        switch(type){

            case 'empty':

                return Object.keys(obj).length == 0;

            default:

                break;

        }

        return Object.prototype.toString.call(obj) === '[object ' + util.capitalize(type) + ']';

    },

    accessors: function(initial, fn, descriptor){

        //closure function for getter/setter value

        return util.extend({

            get: function(){

                return initial;

            },

            set: function(value){

                var i = initial;
                initial = value;
                if(fn) fn.call(this, value, i);

            }

        }, descriptor || Object.create(null));

    },

    //Uppercase first letter
    capitalize: function(str){

        return str.replace(/[a-z]/, function(match){return match.toUpperCase();});

    },

    isEmpty: function(obj){

        //converts the operands to numbers then applies strict comparison
        return Object.keys(obj).length == false;

    },

    noop: function(){}

};

module.exports = util;
