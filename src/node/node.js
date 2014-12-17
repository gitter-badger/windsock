var util = require('../util'),
    Observer = require('../observer'),
    extend = util.extend;

function Node(value){

    this._value = extend({
        value: null,
        data: {}
    }, value);

    Observer.observe(this._value);

}

Node.prototype = {
    valueOf: function(){
        return this._value;
    }
};

Object.defineProperties(Node.prototype, {
    value: {
        get: function(){
            return this._value.value;
        },
        set: function(value){
            this._value.value = value;
        }
    }
});

module.exports = Node;
