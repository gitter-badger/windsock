import {Component} from 'windsock';
import Item from '../item';
import state from '../../core/state';
import item from './binds/item';
import completed from './binds/completed';
import editing from './binds/editing';

const template = `
<li class="completed">\
    <div class="view">\
        <input class="toggle" type="checkbox" checked>\
        <label>Taste JavaScript</label>\
        <button class="destroy"></button>\
    </div>\
    <input class="edit" value="Create a TodoMVC template">\
</li>`;

const parse = (template, component)=>{
    item.render(template, component.data);
    completed.render(template, state, 'route');
    editing.render(template, state, 'editing');
};

export default class Todo extends Item{
    constructor({root}, data){
        super({
            selectors: {
                name: 'todo',
                compile: 'li'
            },
            template,
            parse,
            root,
        }, data);
    }
}

// export default class Todo extends Component{
//     constructor(name, root){
//         super(name, root);
//     }
//     template(todo){
//         //THIS IS INVOKED BY PAREND TEMPLATE RENDER WITH TODO DATA
//         debugger;
//         let template = super.template(todo);
//         item.render(template, todo);
//         return template;
//     }
//     parse(templates){
//         debugger;
//         //super.parse(templates);
//
//         this.templates.forEach((template)=>{
//             //completedIf.render(template, state, 'path');
//         });
//     }
//     compile(compiled){
//         super.compile(compiled);
//         debugger;
//     }
// }
