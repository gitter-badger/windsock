var util = require('../util'),
    Signals = require('../signals'),
    extend = util.extend,
    clone = util.clone,
    each = util.each;

function Node(value){

    this._value = extend(Object.create(this.constructor.value), value);
    this._observer = null;
    this._batch = null;
    this._documentNode = null;
    this._transclude = null;
    this._compiled = false;
    this._events = {};
    this._jsonml = [];

}

Node.value = {};

Node.prototype = {

    _destroy: function(){

        this.off(); //remove all events which are observed and then removed from _documentNode

        if(this._compiled){

            this._batch.cancel();

            if(this._documentNode.parentNode) this._documentNode.parentNode.removeChild(this._documentNode);

            this._observer.unobserve();

            this._compiled = false;

        }

        this._documentNode = null;

        this._transclude = null;

        this._jsonml = null;

    },

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

        var events = Array.prototype.slice.call(arguments,0,1);

        if(!events.length) events = Object.keys(this._events);

        if(signal){

            this._events[name].remove(signal);

            if(this._events[name].count) return;

        }

        each.call(this, events, function(evt){

            this._events[evt].remove();

            if(this._compiled){

                this._events.delete(evt);

            }else{

                delete this._events[evt];

            }

        });

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

    remove: function(){
        var _this = this;
        if(this.parent){
            if(this._compiled){

                this.parent.on('batch', function(){
                    _this.destroy();
                });
                this.parent.children.splice(this.parent.children.indexOf(this), 1); //shouldn't matter the batch is on the parent, make sure to destroy children first
                //Array.prototype.splice.call(this.parent.children, this.parent.children.indexOf(this), 1);
                //doesn't kick off observers so jsonml will not be modified...

            }else{
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            }
            this.parent = null;
        }

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
