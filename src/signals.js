function Signal(fn, context, priority){
    this.binding = fn;
    this.context = context;
    this.priority = typeof priority !== 'undefined' ? priority : 0;
}

Signal.prototype = {
    invoke: function(args){
        if(this.binding) return this.binding.apply(this.context, args);
    }
};

function Signals(){
    this._signals = [];
}

Signals.prototype = {
    dispatch: function(){
        var args = Array.prototype.slice.call(arguments);
        for(var i = 0, l = this._signals.length; i < l; i++){
            this._signals[i].invoke(args);
        }
    },
    add: function(fn, context, priority){
        var signal = new Signal(fn, context, priority),
            i = 0;
        while(i < this._signals.length){
            if(signal.priority <= this._signals[i].priority) break;
            i++;
        }
        this._signals.splice(i, 0, signal);
        return signal;
    },
    queue: function(fn, context){
        return this.add(fn, context, this._signals.length);
    },
    index: function(signal){
        return this._signals.indexOf(signal);
    },
    remove: function(signal){
        if(!signal){
            this._signals = [];
            return;
        }
        var i = this.index(signal);
        if(i !== -1){
            this._signals.splice(i, 1);
        }
        return i;
    }
};

Object.defineProperty(Signals.prototype, 'count', {
    get: function(){
        return this._signals.length;
    }
});

Signals.signal = Signal;

module.exports = Signals;
