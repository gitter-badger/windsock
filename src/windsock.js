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

    options = options || Object.create(null);

    this._model = options.model || Object.create(null);

}

Windsock.prototype = {

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



Windsock.binding = Binding;
Windsock.observer = Observer;
Windsock.view = View;
Windsock.Directive = Directive;

module.exports = Windsock;
