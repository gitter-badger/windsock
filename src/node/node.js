var util = require('../util'),
    Signals = require('../signals'),
    extend = util.extend,
    clone = util.clone,
    is = util.is;

function Node(value){
    this._value = extend(Object.create(null, this.constructor.value), value);
    this._observer = null;
    this._documentNode = null;
    this._transclude = null;
    this._compiled = false;
    this._events = {};
}

Node.value = {};

Node.prototype._destroy = function(){
    //remove all events which are observed and then removed from _documentNode
    this.off();
    if(this._compiled){

        //batch.cancel(this._batch);

        if(!is(this._documentNode.parentNode, 'undefined')) this._documentNode.parentNode.removeChild(this._documentNode);
        this._observer.unobserve();
        this._compiled = false;
    }
    this._documentNode = null;
    this._transclude = null;
    //loop this._value properties and nullify
};

Node.prototype._event = function(name){
    var signals;
    if(!this._events[name]) {
        signals = new Signals();
        if(this._compiled){
            this._events.add(name, signals);
        }else{
            this._events[name] = signals;
        }
    }else{
        signals = this._events[name];
    }
    return signals;
};

Node.prototype._dispatch = function(name, e){
    this._event(name).dispatch(e);
};

Node.prototype.on = function(name, callback){
    return this._event(name).queue(callback, this);
};

Node.prototype.off = function(name, signal){
    var events = Array.prototype.slice.call(arguments,0,1);
    if(!events.length) events = Object.keys(this._events);
    if(signal){
        this._events[name].remove(signal);
        if(this._events[name].count) return;
    }
    for(var i = 0, l = events.length; i < l; i++){
        this._events[events[i]].remove();
        if(this._compiled){
            this._events.delete(events[i]);
        }else{
            delete this._events[events[i]];
        }
    }
};

Node.prototype.clone = function(deep){
    var cloned = new this.constructor(clone(this._value));
    if(deep && this._children){
        for(var i = 0, l = this._children.length; i < l; i++){
            cloned.append(this._children[i].clone(true));
        }
    }
    return cloned;
};

Node.prototype.valueOf = function(){
    return this._value;
};

Node.prototype.toJSON = function(){
    return this.jsonml;
};

Node.prototype.toString = function(){
    return this.html;
};

module.exports = Node;
