var paint, cancelPaint, tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : setTimeout;

if(typeof window !== 'undefined' && window.requestAnimationFrame){
    paint = window.requestAnimationFrame;
    cancelPaint = window.cancelAnimationFrame;
}else{
    paint = setTimeout;
    cancelPaint = clearTimeout;
}

var util = {
    tick: function(fn){
        return tick(fn, 0);
    },
    paint: function(fn){
        return paint(fn, 0);
    },
    cancelPaint: function(id){
        return cancelPaint(id);
    },
    each: function(obj, fn){
        var halt = Object.create(null),
            keys,
            i = 0,
            l;
        //duck typing ftw
        if(typeof obj.length === 'undefined'){
            keys = Object.keys(obj);
            for(l = keys.length; i < l; i++){
                if(fn.call(this, obj[keys[i]], keys[i], obj, halt) === halt) return;
            }
            return;
        }
        //cached length is faster
        for(l = obj.length; i < l; i++){
            if (fn.call(this, obj[i], i, obj, halt) === halt) return;
        }
    },
    traverse: function(list, fn){
        //in order synchronous traversal
        util.each.call(this, list, function traversalIterator(result){
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
    extend: function(obj){
        //adds enumerable properties to object, returns that object
        for(var i = 1, l = arguments.length; i < l; i++){
            for(var key in arguments[i]){
                obj[key] = arguments[i][key];
            }
        }
        return obj;
    },
    merge: function(obj){
        //overwrites enumerable properties inlcuding prototype chain
        var args = Array.prototype.slice.call(arguments, 1);
        for(var i = 0, l = args.length; i < l; i++){
            for(var key in obj){
                if(typeof args[i][key] !== 'undefined') obj[key] = args[i][key];
            }
        }
        return obj;
    },
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
        util.each(query, function matchIterator(val, key){
            if(list[key] !== val) matched = false;
        });
        return matched;
    },
    partial: function(fn){
        var args = Array.prototype.slice.call(arguments, 1);
        return function partial(){
            fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
        };
    },

    bind: function(fn, context){

        var args = Array.prototype.slice.call(arguments, 2);

        return function bindClosure(){

            return fn.apply(context, args.concat(Array.prototype.slice.call(arguments)));

        };

    },

    clone: function(obj){
        var clone = Object.create(null),
            keys = Object.keys(obj);
        for(var i = 0, l = keys.length; i < l; i++){
            clone[keys[i]] = util.is(obj[keys[i]], 'object') ? util.clone(obj[keys[i]]) : obj[keys[i]];
        }
        return clone;
    },

    is: function(obj, type){
        switch(type){
            case 'empty':
            return Object.keys(obj).length === 0;
            case 'undefined':
            return typeof obj === 'undefined';
            case 'null':
            return obj === null;
            default:
            return Object.prototype.toString.call(obj) === '[object ' + util.capitalize(type) + ']';
        }
    },

    capitalize: function(str){
        //Uppercase first letter
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    isEmpty: function(obj){
        //converts the operands to numbers then applies strict comparison
        return Object.keys(obj).length === 0;
    },
    noop: function(){}
};

module.exports = util;
