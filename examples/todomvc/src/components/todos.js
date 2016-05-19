import {Component} from 'windsock';
import Todo from './todo/todo';
import List from '../binds/list';
import state from '../core/state';

const template = '<ul class="todo-list"></ul>';

const parse = (template, component)=>{
    let list = new List(Todo);
    list.render(template, state, 'todos');
};

const compile = (compiled, component)=>{

};

const components = {
    todo: Todo
};
//the todo instance that is passed to the Todo compile function is not the same
//as the instance bound to the temp

export default class Todos extends Component{
    constructor({root}){
        super({
            selectors: {
                name: 'todos',
                compile: {
                    class: 'todo-list'
                }
            },
            components,
            template,
            parse,
            compile,
            root,
        });
    }
}
