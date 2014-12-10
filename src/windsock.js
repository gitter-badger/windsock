var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    Directive = require('./directive'),
    Binding = require('./binding'),
    View = require('./view'),
    vdom = require('./vdom'),
    find = util.find,
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

function Windsock(options){

    this.options = options = options || Object.create(null);

    this._observer = new Observer;

    if(options.model) this.model = options.model;

    if(options.view) this.view = options.view;

}

Windsock.prototype = {

    _setModel: function(data){

        if(this._model) this._observer.unobserve();
        this._observer.observe(data);
        this._model = data;

    },

    _setView: function(view){


    }


};


Object.defineProperties(Windsock.prototype, {

    model:{
        get:function(){
            return this._model;
        },
        set:function(m){
            this._setModel(m);
        },
        enumerable: true
    },
    view:{
        get:function(){
            return this._view;
        },
        set:function(v){
            this._setView(v);
        },
        enumerable: true
    }

});


Windsock.observer = Observer;

Windsock.vdom = vdom;

module.exports = Windsock;
