export default {
    route: function(state, route){
        if(state.route !== route){
            state.route = route;
        }
    },
    editing: function(state, todo){
        state.editing = todo;
    },
    edit: function(state, todo, text){
        todo.text = text;
    },
    add: function(state, text){
        state.todos.push({
            text,
            completed: false
        });
        state.active++;
    },
    toggle: function(state, index, value){
        if(index === true){
            state.todos.forEach((todo)=>{
                todo.completed = value;
            });
            state.active = value ? 0 : state.todos.length;
        }else{
            state.todos[index].completed = !state.todos[index].completed;
            state.todos[index].completed ? state.active-- : state.active++;
        }
    },
    clear: function(state, index){
        let completed,
            active;
        if(index === true){
            completed = state.todos.filter(todo=>todo.completed);
            while(completed.length){
                state.todos.splice(state.todos.indexOf(completed.pop()),1);
            }
            active = state.todos.length;
        }else{
            active = state.todos[index].completed ? state.active : state.active - 1;
            state.todos.splice(index, 1);
        }
        state.active = active;
    }
}