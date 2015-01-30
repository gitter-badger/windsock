var util = require('../util'),
    Node = require('./node'),
    inherit = util.inherit;

function Text(value){
    Node.call(this, value);
    this._parent = null;
}

Text.value = {
    value: ''
};

inherit(Text, Node, {
    value: {
        get: function(){
            return this._value.value;
        },
        set: function(value){
            this._value.value = value;
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

Text.prototype.remove = function(){
    if(this.parent){
        this.parent._children.splice(this.parent._children.indexOf(this), 1);
        this.parent = null;
    }
};

Text.prototype._html = function(){
    return this._value.value;
};

Text.prototype._jsonml = function(){
    return this._value.value;
};

Text.prototype.destroy = function(){
    this.remove();
    this._destroy();
};

module.exports = Text;
