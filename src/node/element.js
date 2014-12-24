var util = require('../util'),
    Fragment = require('./fragment'),
    is = util.is,
    inherit = util.inherit;

function Element(value){

    var selfie = this;

    Fragment.call(this, {

        name: value.name,

        attributes: value.attributes || {},

        children: value.children || []

    });

    this._jsonml.unshift(this.name);

    if(!is(this.attributes, 'empty')) this._jsonml.splice(1, 0, this.attributes);

    //any change to attributes or children will kick off observers
    this._observer.observe(this._value.attributes, false, function(mutation){

        if(is(mutation.object, 'empty') && is(selfie._jsonml[1], 'object')){

            selfie._jsonml.splice(1, 1);

        }else if(selfie._jsonml[1] !== mutation.object){

            selfie._jsonml.splice(1, 0, mutation.object);

        }

    }); //returns attribute signal

    this._observer.observe(this._value.children, false, function(mutation){

        var children = is(selfie.attributes, 'empty') ? selfie._jsonml.splice(1) : selfie._jsonml.splice(2);

        Array.prototype[mutation.type].apply(children, mutation.transformed);

        //selfie is slow, need iterative push
        Array.prototype.push.apply(selfie._jsonml, children);

    }); //returns children signal

}

inherit(Element, Fragment, {

    name:{

        get: function(){

            return this._value.name;

        },

        set: function(name){

            this._value.name = name;

        },

        enumerable: true

    },

    attributes:{

        get: function(){

            return this._value.attributes;

        },

        set: function(attributes){

            this._value.attributes = attributes;

        },

        enumerable: true

    }

});

module.exports = Element;
