(function(){

    'use strict';

    var config = require('./config');

    //grab circular ref to window
    var win = this.window,
        nextPaint = this.requestAnimationFrame || this.setTimeout,
        tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : nextPaint;
        //defer to nextpaint on the client

    var Util = {

        log: function(val){

            if(config.debug && console) console.log(val);

        },

        nextTick: function(callback){
            //defer callback to nextTick in node otherwise requestAnimationFrame in the client
            tick(callback, 0);

        },

        each: function(list, fn, context){

            context = context || this;

            var args = Array.prototype.slice.call(arguments, 3),
                exit = Object.create(null);

            if(list.length){

                for(var i = 0, l = list.length; i < l; i++){

                    if(fn.apply(context, [list[i], i, list, exit].concat(args)) == exit) return;

                }

            }else{

                for(var key in list){

                    if(fn.apply(context, [list[key], key, list, exit].concat(args)) == exit) return;

                }

            }

        },

        traverse: function(list, fn, context){

            context = context || this;

            var args = Array.prototype.slice.call(arguments, 3);

            Util.each(list, function(){

                //call function on result first
                var exit = fn.apply(this, Array.prototype.slice.call(arguments));

                var i = 0;

                while(i < 2){

                    //then check if array/object for further traversal
                    if(arguments[i] instanceof Object && !arguments[i].call){

                        Util.traverse(arguments[i], fn, context, args);

                    }

                    i++;

                }

                return exit;

            }, context, args);

        },

        set: function(obj, props){

            var descriptor = Array.prototype.slice.call(arguments, 2);

            if(descriptor.length) return Object.defineProperty(obj, props, descriptor[0]);

            return Object.defineProperties(obj, props);

        },

        merge: function(obj){

            Util.each(Array.prototype.slice.call(arguments, 1), function(aux){

                for(var key in aux){

                    if(obj.hasOwnProperty(key)) obj[key] = aux[key];

                }

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

        extend: function(obj){

            Util.each(Array.prototype.slice.call(arguments, 1), function(aug){

                for(var key in aug){

                    obj[key] = aug[key];

                }

            });

            return obj;

        },

        //Matches a query object key/values and returns a shallow list of matching results.
        //uses in for properties which includes inherited but not non enumerable props
        match: function(list, query){

            var matched = true;

            Util.each(query, function(val, key){

                if(list[key] !== val) matched = false;

            });

            return matched;

        },

        bind: function(fn, context){

            return function(){

                return fn.apply(context, Array.prototype.slice.call(arguments));

            };

        },

        is: function(obj, type){

            return Object.prototype.toString.call(obj) === '[object ' + Util.upperCase(type) + ']';

        },

        upperCase: function(str){

            return str.replace(/[a-z]/, function(match){return match.toUpperCase()});
        },

        isClient: function(){

            return config.client;

        },

        isEmpty: function(obj){

            for(var key in obj){

                if(Object.prototype.hasOwnProperty.call(obj, key)) return false;

            }

            return true;

        }

    };

    Object.defineProperty(Util, '_ns', {

            value: 'util',
            enumerable: false

    });

    module.exports = Util;

}).call(this);
