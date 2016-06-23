import {Component} from 'windsock';
import Item from '../item.component';
import state from '../../core/state';
import item from './item.bind';
import completed from './completed.bind';
import editing from './editing.bind';

const template = `
<li class="completed">\
    <div class="view">\
        <input class="toggle" type="checkbox" checked>\
        <label>Taste JavaScript</label>\
        <button class="destroy"></button>\
    </div>\
    <input class="edit" value="Create a TodoMVC template">\
</li>`;

export default class Todo extends Item{
    constructor({root}, data){
        super({
            root,
            selectors: {
                name: 'todo',
                compile: 'li'
            },
            template,
        }, data);
    }
    parse(template){
        item.render(template, this.data);
        completed.render(template, state, 'route');
        editing.render(template, state, 'editing');
    }
}
