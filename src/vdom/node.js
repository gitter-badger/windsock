export default class Node{
    constructor(){
        this.compiled = false;
        this.transclude = undefined;
        this.DOMNode = undefined;
        this.observers = [];
        this.bindings = [];
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
        this.DOMNode = undefined;
        while(this.observers.length){
            this.observers.pop().disconnect();
        }
        this.bindings = [];
    }
    clone(){
        let node = new Node();
        node.transclude = this.transclude;
        node.bindings = this.bindings;
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
