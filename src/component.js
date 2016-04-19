export default class Component{
    constructor(config){

        this.root = document;
        this.source = undefined;
        this.template = undefined;
        this.compiled = undefined;
    }
    static component(component){
        Component.components.push(component);
    }
    query(){
        this.source = this.source || querySelector(this.root, )
    }
    parse(){

    }
    bind(){

    }
    compile(){

    }
    render(){
        this.query();
        this.parse();
        this.bind();
        this.compile();
        this.transclude();
    }
}

function querySelector(){}

Component.components = [];

var component = new Component({
    querySelector: 'div#derp', //where to find it in the dom, if its a child component and it exists in the dom
    find: '',
    filter: '',
    template: {}, //we will need to transclude this template if provided where it was originally sourced
    bindings: []

})
