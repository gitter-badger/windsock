var util = require('../util'),
    Signals = require('../signals'),
    extend = util.extend,
    clone = util.clone,
    each = util.each;

function Node(value){

    this._value = extend(Object.create(this.constructor.value), value);
    this._documentNode = null;
    this._transclude = null;
    this._compiled = false;
    this._events = {};
    this._jsonml = [];

}

Node.value = {};

Node.prototype = {

    _event: function(name){

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

    },

    _dispatch: function(name, e){

        this._event(name).dispatch(e);

    },

    on: function(name, callback){

        return this._event(name).queue(callback, this);

    },

    off: function(name, signal){

        if(this._events[name]) {

            if(signal) {

                this._events[name].remove(signal);

            }else{

                this._events[name].remove();

            }

            if(!this._events[name].count){

                if(this._compiled){

                    this._events.delete(name);

                }else{

                    delete this._events[name];

                }

            }

        }else{

            //remove ALL THE EVENTS

        }

    },

    clone: function(deep){

        var cloned = new this.constructor(clone(this._value));

        if(deep && this.children){

            each(this.children, function(child){

                cloned.append(child.clone(true));

            });

        }

        each(this._events, function(signals, event){

            signals.each(function(signal){

                cloned.on(event, signal.binding);

            });

        });

        return cloned;

    },

    render: function(){

        return this._documentNode;

    },

    valueOf: function(){

        return this._value;

    },

    toJSON: function(){

        return this._jsonml;

    },

    toString: function(){

        return JSON.stringify(this._jsonml);

    }

};

module.exports = Node;
