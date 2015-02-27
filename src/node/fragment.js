var inherit = require('../util').inherit,
    Node = require('./node');

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

module.exports = Fragment;
