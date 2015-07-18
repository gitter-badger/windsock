var util = require('../util'),
    Fragment = require('./fragment'),
    Node = require('./node'),
    /*jshint -W079 */
    Text = require('./text'),
    is = util.is,
    each = util.each,
    inherit = util.inherit;

function attributesToString(attr){
    var attribute = '';
    for(var key in attr){
        attribute += ' ' + key;
        if(attr[key]) attribute+= '="' + attr[key] + '"';
    }
    return attribute;
}

function classList(attrs){
    var list = attrs.class && attrs.class.split(' ') || [];
    list.contains = function(cls){
        return this.indexOf(cls) >= 0;
    };
    list.add = function(cls){
        if(!this.contains(cls)){
            this.push(cls);
            attrs.class = (attrs.class + ' ' + cls).trim();
        }
    };
    list.remove = function(cls){
        if(this.contains(cls)){
            this.splice(this.indexOf(cls), 1);
            attrs.class = attrs.class.replace(cls, '').trim();
        }
    };
    list.toggle = function(cls){
        if(this.contains(cls)){
            this.remove(cls);
        }else{
            this.add(cls);
        }
    };
    return list;
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
        enumerable: true,
        configurable: true
    },
    attributes: {
        value: null,
        writable: true,
        enumerable: true,
        configurable: true
    },
    empty: {
        value: false,
        writable: true,
        enumerable: true,
        configurable: true
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

    class:{
        get: function(){
            return classList(this._value.attributes);
        },
        set: function(cls){
            this._value.attributes.class = cls;
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
    if(this.parent){
        Array.prototype.splice.call(this.parent._children, this.parent._children.indexOf(this), 1);
    }
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
