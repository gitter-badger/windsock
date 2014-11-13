var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    Directive = require('./directive'),
    Binding = require('./binding'),
    find = util.find,
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

function Windsock(options){

    options = options || Object.create(null);

    this.directives = {};

    this.bindings = Observer.observable([], false);

    this.bindings.watch(function(mutation){

        //if

    });

    this._model = options.model || Object.create(null);

}

Windsock.prototype = {

    _setModel: function(data){

        //TODO: see if causes memory leak if no clean up of any observers on old data first
        this._model = Observer.observe(data);

    },

    _setView: function(node){
        
    },

    _directive: function(key, closure){

        //private method for adding a directive
        this.directives[key] = closure.call(this, Directive);

    },

    directive: function(key, construct){

        //public method for registering a directive
        if(this.directives[key]){

            throw new Error('failed to register directive ' + key + ', already exists');

        }

        this._directive(key, function(directive){

            return directive.extend(construct);

        });

    },

    binding: function(){

        //convert binding
        var b = Binding.create();
        this.bindings.push(b);

    },

    _compile: function(){

        var directive, node, data;

        for(var i = 0, l = this.bindings.length; i < l; i++){

            directive = this.bindings[i].directive; //fallback to default directive here

            //resolve directive
            if(is(directive, 'string') && this.directives[directive]){

                directive = new this.directives[directive];

            }else{

                //try
                this.directive(directive.name, directive.construct);

            }

            //3 ways to filter model
            //findwhere for array
            //assert for each key/value pair
            //keypath
            directive.model = this.model.find(this.bindings[i].model);
            //and view
            //find
            //filter
            //tagname selector
            directive.view = this.view.find(this.bindings[i].view);
            //bind
            directive.bind();

        }

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

Windsock.binding = Binding;
Windsock.Directive = Directive;
module.exports = Windsock;
