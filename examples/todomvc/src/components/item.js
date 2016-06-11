import {Component, clone, compile} from 'windsock';

export default class Item extends Component{
    constructor(options, data){
        if(!options.template){
            throw new Error('Item component requires a template');
        }
        super(options);
        this.data = data;
    }
    render(c = false){
        var vdom = clone(this.template, true);
        vdom = this.parse && this.parse(vdom, this) || vdom;
        if(c){
            vdom = compile(vdom);
            if(this.compile){
                vdom = this.compile && this.compile(vdom, this) || vdom;
            }
        }
        return vdom;
    }
}