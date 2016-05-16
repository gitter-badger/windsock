import {paint} from '../util';
import Signal from '../signal';

export default class Node{
    constructor(){
        this.compiled = false;
        this.transclude = undefined;
        this.DOMNode = undefined;
        this.observers = [];
        this.bindings = {};
        this.events = defineEventsParent(this);
    }
    get jsonml(){
        return '';
    }
    get html(){
        return '';
    }
    destroy(){
        this.compiled = false;
        this.transclude = undefined;
        paint(()=>{
            this.DOMNode = undefined;
        });
        while(this.observers.length){
            this.observers.pop().disconnect();
        }
        for(let key in this.bindings){
            this.bindings[key].observer.disconnect();
            delete this.bindings[key];
        }
        for(let evt in this.events){
            this.events[evt].remove();
            delete this.events[evt];
        }
    }
    clone(){
        return Node.clone(new Node(), this);
    }
    on(evt, callback){
        if(!this.events[evt]){
            if(this.compiled){
                this.events.add(evt, new Signal());
            }else{
                this.events[evt] = new Signal();
            }
        }
        this.events[evt].add(callback);
    }
    off(evt, callback){
        this.events[evt].remove(callback);
        if(!this.events[evt]){
            delete this.events[evt];
        }
    }
    toJSON(){
        return this.jsonml;
    }
    valueOf(){
        return JSON.stringify(this);
    }
    toString(){
        return this.html;
    }
    static clone(target, instance, deep = false){
        target.transclude = instance.transclude;
        for(let key in instance.bindings){
            target.bindings[key] = instance.bindings[key];
        }
        if(deep){
            for(let evt in instance.events){
                target.events[evt] = new Signal();
                target.events[evt].listeners = instance.events[evt].listeners.slice();
            }
        }
    }
}

function defineEventsParent(instance, events = {}){
    Object.defineProperty(events, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return events;
}
