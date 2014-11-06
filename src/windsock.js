var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

function Windsock(options){

}

Windsock.prototype = {

    parse: function(){
        //accepts am html string, dom element, jsonmlobject
        //converts to a markup object
        //sets this instance markup value
        //kicks off compile if needed
        //returns markup object

        //parser must be a part of markup module instance
        //return this.markup = Markup.apply(this, arguments);

    }

};

Windsock.util = util;

module.exports = Windsock;
