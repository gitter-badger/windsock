import {Component} from 'windsock';
import Todo from './todo/todo.component';
import List from '../binds/list';
import state from '../core/state';

const template = '<ul class="todo-list"></ul>';

let list = new List(Todo);

const components = {
    todo: Todo
};
//the todo instance that is passed to the Todo compile function is not the same
//as the instance bound to the temp

export default class Todos extends Component{
    constructor({root}){
        super({
            root,
            selectors: {
                name: 'todos',
                compile: {
                    class: 'todo-list'
                }
            },
            components,
            template,
        });
    }
    parse(template){
        list.render(template, state, 'todos');
    }
}
