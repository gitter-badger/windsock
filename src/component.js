import {is} from './util';
import parse from './parser/parse';
import compile from './compiler/compile';
import transclude from './transclude';
import clone from './clone';

export default class Component{
    constructor({
        root = true,
        components = {},
        selectors = '',
        template,
        query,
        parse,
        compile,
    }){
        this.root = root;
        this.components = {};
        this.selectors = selectors;
        this.template = template;
        this.query = query;
        this.parse = parse;
        this.compile = compile;
        init(this, components);
    }
    static selector(component, type){
        if(is(component.selectors, 'string')){
            return component.selectors;
        }
        if(component.selectors[type]){
            return component.selectors[type];
        }
        if(component.selectors.name){
            return component.selectors.name;
        }
        throw new Error(`Failed to resolve selector ${type}`);
    }
    static query(component, DOMNode){
        let sources = DOMNode.querySelectorAll(Component.selector(component, 'name'));
        sources = Array.prototype.slice.call(sources);
        sources.forEach((node)=>{
            let child;
            //this hook should be read only!
            //don't do anything to the node here pls
            component.query && component.query(node, component);
            for(let name in component.components){
                child = component.components[name];
                Component.query(child, node);
            }
        });
        return sources;
    }
    static parse(component, sources){
        let templates = [],
            child,
            selector,
            results;

        //a root node will call this with (component, [DOMNodes])
        //subsequent children will invoke this method with already parsed sources
        sources.forEach((node)=>{
            //node is either a DOMNode or a virtualDOM node
            let template;
            if(component.root){
                //if the root component declared a template clone it and copy the transcluded otherwise just parse the node
                if(component.template){
                    template = clone(component.template, true);
                    template.transclude = node;
                }else{
                    template = parse(node);
                }
            }else{
                //an already parsed node, if component has a template, clone it and replace the current node, otherwise just set template to node
                if(component.template){
                    template = clone(component.template, true);
                    node.parent.insert(template, node.index());
                    //could append to parent instead or replace
                    node.destroy();
                }else{
                    template = node;
                }
            }
            //read or write as well as replace
            template = component.parse && component.parse(template, component) || template;
            templates.push(template);

            for(let name in component.components){
                child = component.components[name];
                selector = Component.selector(child, 'name');
                results = template.filter(selector);
                Component.parse(child, results);
            }
        });

        return templates;
    }
    static compile(component, templates){
        let compiled = [],
            child,
            selector,
            results;

        templates.forEach((template)=>{
            let compiledNode = template.compiled ? template : compile(template);
            //read or write but do not replace
            component.compile && component.compile(compiledNode, component, template);
            compiled.push(compiledNode);

            for(let name in component.components){
                child = component.components[name];
                selector = Component.selector(child, 'compile');
                results = compiledNode.filter(selector);
                Component.compile(child, results);
            }
        });

        return compiled;
    }
}

function init(c, components){
    let sources,
        templates,
        compiled;
    c.template = c.template && parse(c.template);
    for(let name in components){
        c.components[name] = new components[name]({
            root: false,
            selectors: name
        });
    }
    if(c.root){
        sources = Component.query(c, document);
        templates = Component.parse(c, sources);
        compiled = Component.compile(c, templates);
        compiled.forEach(transclude); //could append to instead of transclude
    }
}
