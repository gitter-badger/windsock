var util = require('./util'),
    Signals = require('./signals'),
    Parser = require('./parser'),
    Observer = require('./observer'),
    inherit = util.inherit,
    extend = util.extend,
    each = util.each,
    is = util.is;

function Markup(object){

    var markup = Observer.observable(Object.create(Array.prototype));

    Object.defineProperties(markup, {

        node:{
            value: null,
            enumerable: false,
            writable: true
        },

        name:{
            get:function(){
                return markup[0];
            },
            set:function(value){
                if(!markup.length){
                    markup.add(value);
                }else{
                    markup[0] = value;//should kick off dispatch
                }
            }
        },

        attributes:{
            get:function(){
                return is(markup[1], 'object') ? markup[1] : null;
            },
            set:function(value){
                if(!markup.length){
                    throw new Error('failed to set attributes, node name undefined');
                }
                if(is(markup[1], 'object')){
                    markup[1] = value;
                }else{
                    //cant use markup.add because it will push value
                    Array.prototype.splice.call(markup, 1, 0, value);
                    markup._observers.dispatch(Observer.mutation({
                        method: 'add',
                        value: value
                    }));
                }
            },
            enumerable: false
        },

        append:{
            value: function(value){
                //value must be converted into markup object
                markup.add(Markup(value));
            }
        },

        parser:{
            value: new Parser(),
            enumerable:false,
            writable:true
        }

    });

    //add events to markup.parser

    if(object) markup.parser.parse(object);

    return markup;

}

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
        return this.markup = Markup.apply(this, arguments);

    }

};

Windsock.util = util;

module.exports = Windsock;
