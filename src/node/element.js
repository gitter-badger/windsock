var util = require('../util'),
    Node = require('./node'),
    Text = require('./text'),
    is = util.is,
    each = util.each,
    match = util.match,
    inherit = util.inherit;

function parseQuery(query){

    var predicate;

    if(is(query, 'function')) return query;

    if(is(query, 'string')){

        predicate = function(child){

            return child.name === query;

        };

    }else if(is(query, 'object')){

        predicate = function(child){

            return match(child.attributes, query);

        };

    }else{

        throw new Error('failed to parse query, type not supported');

    }

    return predicate;

}

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

            return this.filter(function(child){

                return child instanceof Text;

            }).join('');

        },

        set: function(value){

            if(this.text.length){

                var textNodes = this.filter(function(child){

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

//pre-order traversal returns first result or undefined
Element.prototype.find = function(query){

    var predicate = parseQuery(query),
        result;

    each(this._children, function(child, i, children, halt){

        if(predicate(child)){

            result = child;

        }else if(!is(child.children, 'undefined') && child.children.length){

            result = child.find(predicate);

        }

        if(result) return halt;

    });

    return result;

};

//pre-order traversal returns a flat list result or empty array
Element.prototype.filter = function(query){

    var predicate = parseQuery(query),
        result = [];

    each(this._children, function(child){

        if(predicate(child)) result.push(child);

        if(!is(child.children, 'undefined') && child.children.length) result = result.concat(child.filter(predicate));

    });

    return result;

};

Element.prototype.destroy = function(){

    while(this._children.length){

        this._children[this._children.length-1].destroy();

    }

    this.remove();
    this._destroy();

};

Element.prototype.append = function(node){

    node.parent = this;
    return this._children.push(node);

};

Element.prototype.prepend = function(node){

    node.parent = this;
    return this._children.unshift(node);

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
