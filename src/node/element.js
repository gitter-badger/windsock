var util = require('../util'),
    Node = require('./node'),
    Text = require('./text'),
    is = util.is,
    each = util.each,
    match = util.match,
    inherit = util.inherit;

function Element(value){

    Node.call(this, value);

    this._parent = null;

    this._children = [];

}

Element.value = {

    name: '',

    attributes: {}

};

inherit(Element, Node, {

    name:{

        get: function(){

            return this._value.name;

        }

    },

    attributes:{

        get: function(){

            return this._value.attributes;

        },

        set: function(attributes){

            this._value.attributes = attributes;

        }

    },

    children:{

        get: function(){

            return this._children;

        },

        set: function(children){

            this._children = children;

        }

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

                this.append(new Text({value:value}));

            }

        }

    },

    parent: {

        get: function(){

            return this._parent;

        },

        set: function(parent){

            //remove from previous parent first
            this._parent = parent;

        }

    }

});

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

                return match(child._value, query);

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

Element.prototype.remove = function(){

    if(this.parent) return this.parent.children.splice(this.parent.children.indexOf(this), 1);

};

Element.prototype.append = function(node){

    node.parent = this;
    return this.children.push(node);

};

Element.prototype.prepend = function(node){

    node.parent = this;
    return this.children.unshift(node);

};

Element.prototype.before = function(node){

    if(this.parent){

        node.parent = this.parent;
        return this.parent.children.splice(this.parent.children.indexOf(this), 0, node);

    }

};

Element.prototype.after = function(node){

    if(this.parent){

        node.parent = this.parent;
        return this.parent.children.splice(this.parent.children.indexOf(this)+1, 0, node);

    }

};

module.exports = Element;
