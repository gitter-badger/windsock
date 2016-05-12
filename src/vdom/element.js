import {is, clone} from '../util';
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
        element.transclude = this.transclude;
        for(let key in this.bindings){
            element.bindings[key] = this.bindings[key];
        }
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
