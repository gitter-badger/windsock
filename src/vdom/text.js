import Node from './node';
import {is} from '../util';

export default class Text extends Node{
    constructor(value){
        super();
        this.value = {
            textContent: value
        };
        defineAttributesParent(this, this.value);
        this.parent = undefined;
    }
    get jsonml(){
        return this.value.textContent;
    }
    get html(){
        return this.value.textContent;
    }
    get text(){
        return this.value.textContent;
    }
    set text(value){
        this.value.textContent = value;
    }
    destroy(){
        super.destroy();
        if(!is(this.parent, 'undefined')){
            this.remove();
        }
    }
    clone(){
        let node = new Text(this.value.textContent);
        node.transclude = this.transclude;
        node.bindings = this.bindings;
        return node;
    }
    remove(){
        if(is(this.parent, 'undefined')){
            throw new Error('Failed to remove node');
        }
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
        this.parent = undefined;
    }
}

function defineAttributesParent(instance, value = {}){
    Object.defineProperty(value, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return value;
}
