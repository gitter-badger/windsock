import {is, clone} from '../util';
import Node from './node';
import Fragment from './fragment';

export default class Element extends Fragment{
    constructor(name, attributes = {}, empty = false){
        if(!name){
            throw new Error('Failed to instantiate Element invalid name specified');
        }
        super();
        this.name = name;
        this.attributes = defineAttributesParent(this, attributes);
        this.empty = empty;
    }
    get jsonml(){
        var jsonml = [];
        jsonml.push(this.name);
        if(is(this.attributes, 'empty') === false){
            jsonml.push(clone(this.attributes));
        }
        for(let i = 0, l = this.children.length; i < l; i++){
            jsonml.push(this.children[i].jsonml);
        }
        return jsonml;
    }
    get html(){
        var html = [],
            attrKeys = Object.keys(this.attributes);
        html.push(`<${this.name}`);
        if(attrKeys.length){
            html.push(' ');
            html = html.concat(attrKeys.map((key)=>{
                if(this.attributes[key]){
                    key += `="${this.attributes[key]}"`;
                }
                return key;
            }));
        }
        if(this.empty){
            html.push('/>');
        }else{
            html.push('>');
            for(let i = 0, l = this.children.length; i < l; i++){
                html.push(this.children[i].html);
            }
            html.push(`</${this.name}>`);
        }
        return html.join('');
    }
    get class(){
        if(is(this.classList, 'undefined')){
            this.classList = new ClassList(this.attributes, this.compiled);
        }
        return this.classList;
    }
    destroy(){
        super.destroy();
        if(!is(this.parent, 'undefined')){
            this.remove();
        }
        this.attributes = defineAttributesParent(this);
        this.empty = false;
    }
    clone(deep = false){
        let element = new Element(this.name, clone(this.attributes));
        if(deep && this.children.length){
            this.children.forEach((child)=>{
                element.append(child.clone(true));
            });
        }
        Node.clone(element, this, deep);
        return element;
    }
    remove(){
        if(is(this.parent, 'undefined')){
            throw new Error('Failed to remove node');
        }
        this.parent.children.splice(this.index(), 1);
        this.parent = undefined;
    }
    index(){
        if(is(this.parent, 'undefined')){
            return -1;
        }
        return this.parent.children.indexOf(this);
    }
}

function defineAttributesParent(instance, attributes = {}){
    Object.defineProperty(attributes, 'parent', {
        value: instance,
        enumerable: false,
        writable: false,
        configurable: false
    });
    return attributes;
}

class ClassList{
    constructor(attributes, compiled){
        this.compiled = compiled;
        this.attributes = attributes;
    }
    toggle(str){
        if(invalidClassName(str)){
            throw new Error(`Invalid classname '${str}' passed to toggle method`);
        }
        this.contains(str) ? this.remove(str) : this.add(str);
    }
    add(str){
        if(invalidClassName(str)){
            throw new Error(`Invalid classname '${str}' passed to add method`);
        }
        if(!this.contains(str)){
            if(is(this.attributes.class, 'undefined') && this.compiled){
                this.attributes.add('class', str);
                return;
            }
            if(is(this.attributes.class, 'string') && this.attributes.class.length){
                str = `${this.attributes.class} ${str}`;
            }
            this.attributes.class = str;
        }
    }
    remove(str){
        let i;
        if(invalidClassName(str)){
            throw new Error(`Invalid classname '${str}' passed to remove method`);
        }
        i = this.index(str);
        if(i !== -1){
            if(this.attributes.class.length > str.length){
                str = i === 0 ? str + ' ' : ' ' + str;
            }
            this.attributes.class = this.attributes.class.replace(str, '');
        }
    }
    contains(str){
        if(invalidClassName(str)){
            throw new Error(`Invalid classname '${str}' passed to contains method`);
        }
        return this.index(str) !== -1;
    }
    index(str){
        if(invalidClassName(str)){
            throw new Error(`Invalid classname '${str}' passed to index method`);
        }
        return this.attributes.class ? this.attributes.class.split(' ').indexOf(str) : -1;
    }
}

function invalidClassName(str){
    return /\s/.test(str);
}
