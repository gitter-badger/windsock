(function(){

    'use strict';

    var util = require('./util'),
        Data = require('./data'),
        Markup = require('./markup'),
        is = util.is,
        inherit = util.inherit,
        extend = util.extend,
        each = util.each,
        traverse = util.traverse,
        merge = util.merge;

    module.exports = this.windsock = Windsock;
    
 /**
  * Windsock
  * @constructor
  * @param {object} ops - Object literal of options to be merged.
 */

    function Windsock(ops){

        var windsock = this;

        var options = windsock.options = {

            data: Object.create(null),

            markup: Object.create(null),

            bindings: Windsock.bindings,

            selectors: Windsock.selectors

        };

        Data.proxy(windsock, options);

        Data.observe(options, 'markup', function(method){

            switch(method){
                case 'set':
                    //parse new markup
                    this.value = new Markup(this.value);
                    //and rebind
                break;
            }

        });

        Data.observe(options, 'data', function(method){

            switch(method){
                case 'set':
                    //rebind
                break;
            }

        });

        if(ops) merge(windsock, ops);

        Windsock.bind(windsock.data, windsock.markup, windsock.bindings);

    }

    //instead of a keypath, pass the actual object and key
    Windsock.observe = function(obj, key, fn){

        Data.observe(obj, key, fn);

    };

    Windsock.prototype.observe = function(key, fn){

        if(this.data[key]) Data.observe(this.data, key, fn);

    };

    Windsock.prototype.find = function(query){

        return this.markup.find(query);

    };

    Windsock.extend = function(obj){

        var windsock = function(){

            Windsock.call(this);

        };

        inherit(windsock, Windsock);

        extend(windsock.prototype, obj);

        return windsock;

    };

    //default bindings,
    //values are passed to selectors to determine matches
    //if function, its passed the entire object
    //both must evaluate to true inside selector to have bind method applied
    Windsock.bindings = [{

        data: function(){return true;},
        markup: function(){return true;},
        bind: function(){

            console.log('data changed');

        },
        manip: function(){
            //optional manip function for data, would this be useful?
        }

    }];

    //how to use bindings on object, responsible for looping and returning results
    Windsock.selector = {

        //this is the queryobject
        data: function(key, val, obj){

            //console.log(this);

            if(is(this, 'string')){
                //console.log('in hur');

                //this is called to match
                if(key == this) return true;
                return false;

            }

        },

        markup: function(node, index, parent){

            if(is(this, 'string')){

                if(node == this) return true;
                return false;

            }

        }

    };

    Windsock.bind = function(data, markup, bindings){

        each(bindings, function(binding){

            //Windsock.selector.data.apply(binding.data, )

            traverse(data, function(key, value, obj){

                //if binding isnt a selector, pass it and the args to the default selector
                if(Windsock.selector.data.apply(binding.data, arguments)){

                    console.log('matched data');
                    //console.log(arguments);

                    traverse(markup, function(val, index, node){



                        if(Windsock.selector.markup.apply(binding.markup, arguments)){

                            console.log('matched markup');
                            //console.log(arguments);

                            //if array
                            //if binding.bind > default callback for observe


                            Windsock.observe(obj, key, function(method){
                                if(method == 'get') return;


                                //and then change dom somehow lolz - will happen if node has dom ref
                            });



                        }

                    });

                }

            });

        });

    };

}).call(this);
