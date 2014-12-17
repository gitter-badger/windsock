var util = require('../util'),
    Node = require('./node'),
    inherit = util.inherit;

function Text(value){

    Node.call(this, {
        value: value || ''
    });

}

inherit(Text, Node);

Text.prototype.valueOf = function(){
    return this._value.value;
};

Text.prototype.toJSON = function(){
    return this._value.value;
};

Text.prototype.clone = function(){
    return new Text(this.valueOf());
};

module.exports = Text;
