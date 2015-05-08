var /*jshint -W079 */
    Text = require('./text'),
    util = require('../util'),
    Node = require('./node'),
    is = util.is,
    each = util.each,
    match = util.match,
    inherit = util.inherit;

function parseQuery(query){
    if(is(query, 'function')) return query;
    if(is(query, 'string')){
        return function nodeNamePredicate(child){
            if(child instanceof Text) return false;
            return child.name === query;
        };
    }
    if(is(query, 'object')){
        return function nodeAttributePredicate(child){
            if(child instanceof Text) return false;
            return match(child.attributes, query);
        };
    }
    throw new Error('failed to parse query, type not supported');
}

function Fragment(value){
    Node.call(this, value);
    this._children = [];
}

Fragment.value = {};

inherit(Fragment, Node, {
    children:{
        get: function(){
            return this._children;
        },
        set: function(children){
            this._children = children;
        }
    }
});

Fragment.prototype.destroy = function(){
    var i = this._children.length;
    while(i){
        i--;
        this._children[i].destroy();
    }
    this._destroy();
};

Fragment.prototype.append = function(node){
    if(node.remove) node.remove();
    node.parent = this;
    return this._children.push(node);
};

Fragment.prototype.prepend = function(node){
    if(node.remove) node.remove();
    node.parent = this;
    return this._children.unshift(node);
};

Fragment.prototype.insert = function(node, i){
    if(node.remove) node.remove();
    node.parent = this;
    return this._children.splice(i, 0, node);
};

//pre-order traversal returns first result or undefined
Fragment.prototype.find = function(query){
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
Fragment.prototype.filter = function(query){
    var predicate = parseQuery(query),
        result = [];
    each(this._children, function(child){
        if(predicate(child)) result.push(child);
        if(!is(child.children, 'undefined') && child.children.length) result = result.concat(child.filter(predicate));
    });
    return result;
};

module.exports = Fragment;
