import {Component} from 'windsock';
import Todos from '../todos.component';
import state from '../../core/state';
import store from '../../core/store';
import text from '../../binds/text';
import length from './length.bind';
import link from './link.bind';
import clear from './clear.bind';
import toggle from './toggle.bind';

const template = `
<section class="todoapp">
    <header class="header">
        <h1>todos</h1>
        <input class="new-todo" placeholder="What needs to be done?" autofocus>
    </header>
    <section class="main">
        <input class="toggle-all" type="checkbox">
        <label for="toggle-all">Mark all as complete</label>
        <todos></todos>
    </section>
    <footer class="footer">
    <span class="todo-count"><strong>0</strong> item left</span>
    <ul class="filters">
      <li>
        <a class="selected" href="#/">All</a>
      </li>
      <li>
        <a href="#/active">Active</a>
      </li>
      <li>
        <a href="#/completed">Completed</a>
      </li>
    </ul>
    <button class="clear-completed">Clear completed</button>
    </footer>
</section>
<footer class="info">
    <p>Double-click to edit a todo</p>
    <p>Created by <a href="github.com/bsawyer/windsock">Ben Sawyer</a></p>
    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
</footer>`;

const components = {
    todos: Todos
};

const options = {
    selectors: 'app',
    template,
    components,
};

export default class App extends Component{
    constructor(){
        super(options);
    }
    parse(template){
        let footer = template.find('footer');
        length.render(footer, state, 'todos');
        link.render(footer.filter('a'), state, 'route');
        clear.render(footer.find({class:'clear-completed'}), state);
        text.render(footer.find('strong'), state, 'active');
        toggle.render(template.find({class: 'toggle-all'}), state, 'active');
    };
    compile(compiled){
        compiled.find({class:'new-todo'})
            .on('keyup', (e, input)=>{
                if(e.keyCode === 13 && input.DOMNode.value){
                    store.dispatch('add', input.DOMNode.value);
                    input.DOMNode.value = '';
                }
            });
        compiled.find({class:'clear-completed'})
            .on('click', ()=>{
                store.dispatch('clear', true);
            });
        compiled.find({class: 'toggle-all'})
            .on('change', (e, node)=>{
                store.dispatch('toggle', true, node.DOMNode.checked);
            });
    }
}