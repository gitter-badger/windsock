var util = require('../util'),
    Node = require('./node'),
    Observer = require('../observer'),
    is = util.is,
    inherit = util.inherit;

function Element(jsonml){

    var childrenIndex = is(jsonml[1], 'object') && !(jsonml[1] instanceof Node) ? 2 : 1;

    Node.call(this, {
        name: jsonml[0],
        attributes: childrenIndex === 2 ? jsonml[1] : {},
        children: jsonml.slice(childrenIndex)
    });

    this._jsonml = jsonml;
    //observer mutations to update _jsonml
    Observer.observe(this._value.attributes)
            .observers.add(function(mutation){

                if(is(mutation.object, 'empty') && is(this._jsonml[1], 'object')){

                    this._jsonml.splice(1, 1);

                }else if(this._jsonml[1] !== mutation.object){

                    this._jsonml.splice(1, 0, mutation.object);

                }

            }, this);

}

inherit(Element, Node);

Object.defineProperties(Element.prototype, {

    name:{
        get: function(){
            return this._value.name;
        },
        set: function(name){
            this._value.name = name;
        }
    },
    attributes:{
        get: function(){
            return this._value.attributes;
        },
        set: function(attributes){
            this._value.attributes = attributes;
        }
    }

});

Element.prototype.valueOf = function(){
    return this._jsonml;
};

Element.prototype.toJSON = function(){
    return this._jsonml;
};

Element.prototype.clone = function(){
    return new Element(this.valueOf());
};

module.exports = Element;
