import Node from './node';
import Text from './text';
import {is, match} from '../util';

export default class Fragment extends Node{
    constructor(){
        super();
        this.children = defineChildrenParent(this);
    }
    get jsonml(){
        throw new Error('Cannot convert to jsonml');
    }
    get html(){
        return this.children
            .map((child)=>{
                return child.html;
            })
            .join('');
    }
    destroy(){
        super.destroy();
        let i = this.children.length;
        while(i){
            i--;
            this.children[i].destroy();
        }
    }
    clone(deep = false){
        let fragment = new Fragment();
        if(deep && this.children.length){
            this.children.forEach((child)=>{
                fragment.append(child.clone(true));
            });
        }
        fragment.transclude = this.transclude;
        for(let key in this.bindings){
            fragment.bindings[key] = this.bindings[key];
        }
        return fragment;
    }
    append(node){
        if(this.compiled !== node.compiled){
            throw new Error('Node compiled value does not match');
        }
        if(!is(node.parent, 'undefined')){
            node.remove();
        }
        node.parent = this;
        this.children.push(node);
    }
    prepend(node){
        if(this.compiled !== node.compiled){
            throw new Error('Node compiled value does not match');
        }
        if(!is(node.parent, 'undefined')){
            node.remove();
        }
        node.parent = this;
        this.children.unshift(node);
    }
    insert(node, i){
        if(this.compiled !== node.compiled){
            throw new Error('Node compiled value does not match');
        }
        if(!is(node.parent, 'undefined')){
            node.remove();
        }
        node.parent = this;
        this.children.splice(i, 0, node);
    }
    find(query){
        //pre-order traversal returns first result or undefined
        let predicate = parseQuery(query),
            result;
        for(var i = 0, l = this.children.length; i < l; i++){
            if(predicate(this.children[i])){
                return this.children[i];
            }else if(!is(this.children[i].find, 'undefined')){
                result = this.children[i].find(predicate);
                if(!is(result, 'undefined')){
                    return result;
                }
            }
        }
    }
    filter(query){
        //pre-order traversal returns a flat list result or empty array
        let predicate = parseQuery(query),
            result = [];
        for(var i = 0, l = this.children.length; i < l; i++){
            if(predicate(this.children[i])){
                result.push(this.children[i]);
            }
            if(!is(this.children[i].filter, 'undefined')){
                result = result.concat(this.children[i].filter(predicate));
            }
        }
        return result;
    }
    text(){
        return this.filter(textFilter).join('');
    }
}

function defineChildrenParent(instance, children = []){
    Object.defineProperty(children, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return children;
}

function nodeNamePredicate(query, child){
    return child.name && child.name === query;
}

function nodeAttributePredicate(query, child){
    if(child instanceof Text || child instanceof Fragment){
        return false;
    }
    return match(child.attributes, query);
}

function parseQuery(query){
    if(is(query, 'function')){
        return query;
    }else if(is(query, 'string')){
        return nodeNamePredicate.bind(null, query);
    }else if(is(query, 'object')){
        return nodeAttributePredicate.bind(null, query);
    }
    throw new Error('specified query type not supported');
}

function textFilter(node){
    return node instanceof Text;
}
