var util = require('./util'),
    Signals = require('./signals'),
    noop = util.noop,
    merge = util.merge,
    extend = util.extend,
    each = util.each,
    accessors = util.accessors,
    define = Object.defineProperty;

function Binding(){

    

}

Binding.prototype = {};



Binding.create = function(config){

    var binding = Object.create(Object.prototype, {

        update:{

            value: new Signals,
            enumerable: false,
            writable: true

        }

    });

    config = merge({

        view: null,
        model: null,
        directive: noop

    }, config || Object.create(null));

    each(config, function(value, key){

        define(binding, key, accessors(value, function(val, last){

            binding.update.dispatch(val, last);

        }, {

            enumerable: true

        }));

    });

    return binding;

};

module.exports = Binding;
