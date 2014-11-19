var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    Directive = require('./directive'),
    Binding = require('./binding'),
    View = require('./view'),
    find = util.find,
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;


//Windsock constructor
function Windsock(options){

    this.options = options = options || Object.create(null);

    this._model = options.model || Object.create(null);

    this.bindings = [];

    if(options.view) this.view = new View(options.view);

    if(options.bindings){

        each.call(this, this.bindings, function(binding){

            this.bindings.push(new Binding(binding));

        });

    }



}

Windsock.prototype = {

    init: function(){

        each.call(this, this.bindings, function(){

            var views = this.view.find(this.view),
                model = this.model;

            each.call(this, views, function(view){

                var directive = Directive.extend(function(){

                    this.view = view;
                    this.model = model;

                })

            });

        });

    },

    _setModel: function(data){

        //TODO: see if causes memory leak if no clean up of any observers on old data first
        this._model = Observer.observe(data);

    }


};

Object.defineProperty(Windsock.prototype, 'model', {

    get: function(){

        return this._model;

    },

    set: function(data){

        this._setModel(data);

    }

});



Windsock.observer = Observer;


module.exports = Windsock;
