var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    Markup = require('./markup'),
    Binding = require('./binding'),
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;




function Windsock(options){

    options = options || {};

    this._bindings = null; //can be an object or

    Object.defineProperty(this, 'bindings', {

        get: function(){
            return this._bindings;
        },
        set:function(bindings){
            each(bindings, function(){

            })
        }

    });

}

Windsock.binding = Binding;
module.exports = Windsock;
