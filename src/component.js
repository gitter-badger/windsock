import parse from './parser/parse';
import compile from './compiler/compile';
import transclude from './transclude';
import clone from './clone';

export default class Component{
    constructor(name, root){
        let components = this.constructor.components;
        this.name = name;
        this.root = root || document;
        this.components = {};
        this._template = undefined;
        this.sources = [];
        this.templates = [];
        this.compiled = [];
        if(components){
            for(let name in components){
                this.components[name] = new components[name](name, true);
            }
        }
        if(!root){
            this.query();
            this.parse();
            this.compile();
            this.compiled.forEach(transclude);
        }
    }
    query(root){
        root = root || this.root;
        let results = root.querySelectorAll(this.name);
        this.sources = this.sources.concat(Array.prototype.slice.call(results));
        this.sources.forEach((source)=>{
            for(let name in this.components){
                this.components[name].query(source);
            }
        });
    }
    template(){
        if(!this._template){
            this._template = parse(this.constructor.template);
        }
        return clone(this._template, true);
    }
    parse(templates){
        if(templates && this.constructor.template){
            templates = templates.map((template)=>{
                var templateClone = this.template();
                template.parent.insert(templateClone, template.index());
                template.destroy();
                return templateClone;
            });
        }
        templates = templates || this.sources.map((source)=>{
            let template;
            if(this.constructor.template){
                template = this.template();
                template.transclude = source;
            }else{
                template = parse(source);
            }
            return template;
        });
        this.templates = this.templates.concat(templates);
        this.templates.forEach((template)=>{
            for(let name in this.components){
                this.components[name].parse(template.filter(name));
            }
        });
    }
    compile(compiled){
        compiled = compiled || this.templates.map(compile);
        this.compiled = this.compiled.concat(compiled);
        this.compiled.forEach((vdom)=>{
            for(let name in this.components){
                this.components[name].compile(vdom.filter(name));
            }
        });
    }
}

Component.component = function(name, cls){
    if(Component.components[name]){
        console.warn(`Global ${name} component already exists`);
    }
    Component.components[name] = cls;
};

Component.components = {};
