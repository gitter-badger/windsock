var util = require('../util'),
    Fragment = require('./fragment'),
    Node = require('./node'),
    /*jshint -W079 */
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

function attributesToString(attr){
    var attribute = '';
    for(var key in attr){
        attribute += ' ' + key;
        if(attr[key]) attribute+= '="' + attr[key] + '"';
    }
    return attribute;
}

function Element(value){
    Node.call(this, value);
    this._parent = null;
    this._children = [];
}

Element.value = {
    name: {
        value: '',
        writable: true,
        enumerable: true
    },
    attributes: {
        value: null,
        writable: true,
        enumerable: true
    },
    empty: {
        value: false,
        writable: true,
        enumerable: true
    }
};

inherit(Element, Fragment, {

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

    empty:{
        get: function(){
            return this._value.empty;
        }
    },

    text:{
        get: function(){
            return this.filter(function(child){
                return child instanceof Text;
            }).join('');
        },
        set: function(value){
            var textNodes = this.filter(function(child){
                return child instanceof Text;
            });
            if(textNodes.length){
                each(textNodes, function(text, i){
                    if(i === 0){
                        text.value = value;
                    }else{
                        text.remove();
                    }
                });
                return;
            }
            if(!this._compiled){
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
    },

    html:{
        get: function(){
            return this._html();
        }
    },

    jsonml:{
        get: function(){
            return this._jsonml();
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

Element.prototype._html = function(){
    var html = [];
    html.push('<' + this._value.name);
    html.push(attributesToString(this._value.attributes));
    if(this.empty){
        html.push('/>');
    }else{
        html.push('>');
        for(var i = 0, l = this._children.length; i < l; i++){
            html.push(this._children[i]._html());
        }
        html.push('</' + this._value.name + '>');
    }
    return html.join('');
};

Element.prototype._jsonml = function(){
    var jsonml = [];
    jsonml.push(this._value.name);
    if(!is(this._value.attributes, 'empty'))jsonml.push(this._value.attributes);
    if(this._children.length){
        for(var i = 0, l = this._children.length; i < l; i++){
            jsonml.push(this._children[i]._jsonml());
        }
    }
    return jsonml;
};

Element.prototype.remove = function(){
    if(this.parent){
        this.parent._children.splice(this.parent._children.indexOf(this), 1);
        this.parent = null;
    }
};

Element.prototype.destroy = function(){
    var i = this._children.length;
    while(i){
        i--;
        this._children[i].destroy();
    }
    this.remove();
    this._destroy();
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
