var util = require('../util'),
    Node = require('./node'),
    Text = require('./text'),
    Observer = require('../observer'),
    is = util.is,
    each = util.each,
    match = util.match,
    inherit = util.inherit;

function Element(value){

    Node.call(this, {
        name: value.name,
        attributes: value.attributes || {},
        children: value.children || []
    });

    this._jsonml = [this.name];
    if(!is(this.attributes, 'empty')) this._jsonml.push(this.attributes);
    if(this.children.length) Array.prototype.push.apply(this._jsonml, this.children);

    this._value.attributes._recursive = false;
    this._value.children._recursive = false;

    //observer mutations to update _jsonml
    //these are anonymous observers
    Observer.observe(this._value.attributes)
            .observers.add(function(mutation){

                if(is(mutation.object, 'empty') && is(this._jsonml[1], 'object')){

                    this._jsonml.splice(1, 1);

                }else if(this._jsonml[1] !== mutation.object){

                    this._jsonml.splice(1, 0, mutation.object);

                }

            }, this);

    Observer.observe(this._value.children)
            .observers.add(function(mutation){

                var children = is(this.attributes, 'empty') ? this._jsonml.splice(1) : this._jsonml.splice(2);

                Array.prototype[mutation.type].apply(children, mutation.transformed);

                Array.prototype.push.apply(this._jsonml, children);

            }, this);

}

inherit(Element, Node);

Element.prototype.find = function(query){

    var result = [],
        find;

    if(!is(query, 'function')){

        if(is(query, 'string')){

            find = function(child){

                return child.name === query;

            };

        }else if(is(query, 'object')){

            find = function(child){

                return match(child.attributes, query);

            };

        }else{

            throw new Error('failed to find, query not supported');

        }

    }else{

        find = query;

    }

    each(this.children, function(child){

        if(find(child)) result.push(child);

        if(!is(child.children, 'undefined') && child.children.length) result = result.concat(child.find(find));

    });

    return result;

};

Element.prototype.toString = function(){

    //should do?
    return JSON.stringify(this._jsonml);

};

Object.defineProperties(Element.prototype, {

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

    },

    children:{

        get: function(){

            return this._value.children;

        },

        set: function(children){

            this._value.children = children;

        },

        enumerable: true

    },

    text:{

        get: function(){

            return this.find(function(child){

                return child instanceof Text;

            }).join('');

        },

        set: function(value){

            if(this.text.length){

                var textNodes = this.find(function(child){

                    return child instanceof Text;

                });

                each(textNodes, function(text, i){

                    if(i === 0){

                        text.value = value;

                    }else{

                        text.remove();

                    }

                });

            }else{

                this.append(new Text(value));

            }

        },

        enumerable: true

    }

});

module.exports = Element;
