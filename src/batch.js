var util = require('./util'),
    bind = util.bind,
    paint = util.paint,
    cancel = util.cancel;

function Batch(fn){

    this._done();
    this.callback = fn;
    this.args = Array.prototype.slice.call(arguments, 1);

}

Batch.prototype = {

    add: function(fn){

        this.queue.push(fn);

        if(!this.requested) {

            this.id = paint(bind(this._run, this));
            this.requested = true;

        }

    },

    cancel: function(){

        cancel(this.id);
        this._done();

    },

    _run: function(){

        this.running = true;

        for(var i = 0; i < this.queue.length; i++){

            this.queue[i].apply(this, this.args);

        }

        this._done();

    },

    _done: function(){

        this.queue = [];
        this.requested = false;
        this.running = false;
        this.id = null;
        if(this.callback) this.callback.apply(this, this.args);

    }

};

module.exports = Batch;
