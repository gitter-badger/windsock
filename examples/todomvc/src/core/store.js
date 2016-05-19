import {Store} from 'windsock';
import state from './state';
import mutations from './mutations';

const TODOS_KEY = 'todos';

let todos = localStorage.getItem(TODOS_KEY);
todos = todos ? JSON.parse(todos) : [];
state.active = todos.filter(todo=>!todo.completed).length;
state.todos = todos;

export default new Store(state, mutations, (name, state)=>{
    localStorage.setItem(TODOS_KEY, JSON.stringify(state.todos));
});