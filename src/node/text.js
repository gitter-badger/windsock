var util = require('../util'),
    Node = require('./node'),
    inherit = util.inherit;

function Text(value){

    Node.call(this, {

        value: value || ''

    });

    this.observe(function(mutation){

        if(mutation.name === 'value') this._jsonml = mutation.object[mutation.name];

    });

    this._jsonml = this._value.value;

}

inherit(Text, Node);

Text.prototype.append = function(value){

    this._value.value = this._value.value + value;

};

Text.prototype.prepend = function(value){

    this._value.value = value + this._value.value;

};

Text.prototype.find = function(query){

    return this._value.indexOf(query);

};

Text.prototype.valueOf = function(){

    return this._value.value;

};

Text.prototype.toString = function(){

    return this._value.value;

};

module.exports = Text;
