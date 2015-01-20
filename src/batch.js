var util = require('./util'),
    paint = util.paint,
    cancelPaint = util.cancelPaint;

var id,
    requested,
    running,
    queue;

function done(){
    id = null;
    requested = false;
    running = false;
    queue = [];
}

function run(){
    running = true;
    for(var i = 0; i < queue.length; i++){
        queue[i].call();
    }
    done();
}

done();

exports.cancel = function cancel(){
    cancelPaint(id);
    done();
};

exports.add = function add(fn){
    queue.push(fn);
    if(!requested) {
        id = paint(run);
        requested = true;
    }
    return id;
};
