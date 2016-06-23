import {is} from './util';
import parse from './parser/parse';
import compile from './compiler/compile';
import transclude from './transclude';
import clone from './clone';
import Node from './vdom/node';

export default class Component{
    constructor({
        root = true,
        components = {},
        selectors = '',
        template = ''
    } = {}){
        if(!is(components, 'object')){
            throw new Error('Invalid components type must be an object map');
        }
        if(!is(template, 'string') && !is(template, 'object')){
            throw new Error('Invalid selectors type must be a string or object');
        }
        if(!is(template, 'string') && !is(template, 'function')){
            throw new Error('Invalid template type must be a string or function');
        }

        this.root = root;
        this.components = {};
        this.selectors = selectors;
        this.template = template;

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
        sources.forEach(function componentQueryIterator(node){
            let child;
            //read-only hook
            component.query && component.query(node, component);
            for(let name in component.components){
                child = component.components[name];
                Component.query(child, node);
            }
        });
        return sources;
    }
    static parse(component, sources){
        //a root node will call this with (component, [DOMNodes])
        //subsequent children will invoke this method with already parsed sources
        let templates = [],
            child,
            selector,
            results;

        sources.forEach(function componentParseIterator(node){
            let template;

            if(component.template){
                template = is(component.template, 'function') ? component.template(node, component) : clone(component.template, true);
                if(component.root){
                    template.transclude = node;
                }else{
                    node.parent.insert(template, node.index());
                    //could append to parent instead or replace
                    node.destroy();
                }
            }else{
                template = component.root ? parse(node) : node;
            }

            //read or write as well as replace
            template = component.parse && component.parse(template, component, node) || template;
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

        templates.forEach(function componenetCompileIterator(template){
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

function init(component, components){
    let sources,
        parsed,
        compiled;

    if(is(component.template, 'string')){
        component.template = parse(component.template);
    }

    for(let name in components){
        component.components[name] = new components[name]({
            root: false,
            selectors: name
        });
    }

    if(component.root){
        if(typeof document !== 'undefined'){
            sources = Component.query(component, document);
        }else{
            if(!component.root instanceof Node){
                throw new Error('Unspecified virtual root node');
            }
            sources = [component.root];
        }

        parsed = Component.parse(component, sources);
        compiled = Component.compile(component, parsed);
        
        if(typeof document !== 'undefined'){
            compiled.forEach(transclude);
        }else{
            component.parsed = parsed;
            component.compiled = compiled;
        }
    }
}
