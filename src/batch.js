var paint = require('./util').nextPaint;

function Batch(fn){

    this._done();
    this.callback = fn;

}

Batch.prototype = {

    add: function(fn){

        this.queue.push(fn);

        if(!this.requested) {

            this.id = paint(this._run, this);
            this.requested = true;

        }

    },

    cancel: function(){

        if(typeof window !== 'undefined' && window.cancelAnimationFrame) window.cancelAnimationFrame(this.id);
        this._done();

    },

    _run: function(){

        this.running = true;

        for(var i = 0; i < this.queue.length; i++){

            this.queue[i].call(this);

        }

        this._done();

    },

    _done: function(){

        this.queue = [];
        this.requested = false;
        this.running = false;
        this.id = null;
        if(this.callback) this.callback.call(this);

    }

};

module.exports = Batch;
