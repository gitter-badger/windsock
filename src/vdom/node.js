import {paint} from '../util';

export default class Node{
    constructor(){
        this.compiled = false;
        this.transclude = undefined;
        this.DOMNode = undefined;
        this.observers = [];
        this.bindings = {};
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
        }
    }
    clone(){
        let node = new Node();
        node.transclude = this.transclude;
        for(let key in this.bindings){
            node.bindings[key] = this.bindings[key];
        }
        return node;
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
}
