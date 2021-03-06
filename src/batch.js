import {paint, cancelPaint} from './util';

const queue = [];

let id,
    requested;

function done(){
    id = null;
    requested = false;
    queue.length = 0;
}

done();

function run(){
    for(var i = 0; i < queue.length; i++){
        queue[i].call();
    }
    done();
}

export function cancel(){
    cancelPaint(id);
    done();
};

export function add(fn){
    queue.push(fn);
    if(!requested){
        id = paint(run);
        requested = true;
    }
    return id;
};
