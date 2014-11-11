var util = require('./util'),
    Signals = require('./signals'),
    noop = util.noop,
    extend = util.extend,
    each = util.each,
    accessors = util.accessors,
    define = Object.defineProperty;

function Binding(){}

Binding.prototype = {}

Binding.create = function(config){

    var binding = Object.create(Object.prototype, {

        update:{

            value: new Signals,
            enumerable: false,
            writable: true

        }

    });

    config = extend({

        view: null,
        model: null,
        bind: noop

    }, config || Object.create(null));

    each(config, function(v, key){

        define(binding, key, accessors(v, function(value, last){

            binding.update.dispatch(value, last);

        }, {

            enumerable: true

        }));

    });

    return binding;

};

module.exports = Binding;
