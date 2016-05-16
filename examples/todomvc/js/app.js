import {
    Signal,
    router,
    Observer,
    Store,
    Bind,
    parse,
    compile,
    Component
} from '../../../src/index';

const TODOS = 'todos',
      state = {
          todos: [],
          active: 0,
          editing: null,
          path: ''
      },
      NONE = 'display:none;',
      newTodo = {
          text: ''
      };

getTodos();

function getTodos(){
    let todos = localStorage.getItem(TODOS);
    todos = todos ? JSON.parse(todos) : [];
    state.active = todos.filter(todo=>!todo.completed).length;
    state.todos = todos;
}

const mutations = {
    route: function(state, path){
        if(state.path !== path){
            state.path = path;
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
        let completed;
        if(index === true){
            completed = state.todos.filter(todo=>todo.completed);
            while(completed.length){
                state.todos.splice(state.todos.indexOf(completed.pop()),1);
            }
            state.active = state.todos.length;
        }else{
            state.todos.splice(index, 1);
        }
    }
};

const store = new Store(state, mutations, (name, state)=>{
    localStorage.setItem(TODOS, JSON.stringify(state.todos));
});

router.register('#', {
    activate: function(){
        store.dispatch('route', '');
    }
});

router.register('#/active', {
    activate: function() {
        store.dispatch('route', 'active');
    }
});

router.register('#/completed', {
    activate: function() {
        store.dispatch('route', 'completed');
    }
});

class If extends Bind{
    constructor(predicate, remove = false){
        let toggle = (node, binding)=>{
            this.predicate(node, binding) ? this.show(node) : this.hide(node);
        };
        super({
            bind: (node)=>{
                return{
                    node: node,
                    prop: remove ? 'node' : 'style'
                };
            },
            compile: toggle,
            update: toggle
        });

        this.predicate = predicate;
        this.remove = remove;
    }
    show(node){
        if(this.remove){
            node.lastParent && node.lastParent.append(node);
        }else{
            if(node.attributes.style){
                node.attributes.style = node.attributes.style.replace(NONE, '');
            }
        }
    }
    hide(node){
        let parent;
        if(this.remove){
            parent = node.parent;
            node.remove();
            node.lastParent = parent;
        }else{
            if(node.attributes.style && node.attributes.style.indexOf(NONE) !== -1){
                return;
            }
            if(typeof node.attributes.style !== 'undefined'){
                node.attributes.style += NONE;
            }else{
                if(node.compiled){
                    node.attributes.add('style', NONE);
                }else{
                    node.attributes.style = NONE;
                }
            }
        }
    }
}

let lengthIf = new If((node, binding)=>{
    return binding.target.value.length;
});

let completedIf = new If((node, binding)=>{
    switch (binding.target.parent[binding.target.key]) {
        case '':
            return true;
            break;
        case 'active':
            return node.attributes.class.indexOf('completed') === -1;
            break;
        case 'completed':
            return node.attributes.class.indexOf('completed') !== -1;
    }
});

let todoBind = new Bind({
    bind: (node, target)=>{
        let input = node.find({class:'edit'});
        input.attributes.value = target.value.text;
        node.find('label').children[0].text = target.value.text;
        node.attributes.class = target.value.completed ? 'todo completed' : 'todo';
        if(target.value.completed === false){
            delete node.find({class: 'toggle'}).attributes.checked;
        }
        return {
            node: node,
            prop: 'attributes,children'
        };
    },
    update: (node, binding, mutation)=>{
        let checkbox = node.find({class: 'toggle'}),
            input = node.find({class: 'edit'});
        if(mutation.type === 'completed'){
            node.attributes.class = mutation.newValue ? 'todo completed' : 'todo';
            setChecked(checkbox, mutation.newValue);
        }
        if(mutation.type === 'text'){
            node.find('label').children[0].text = mutation.newValue;
            if(node.compiled){
                input.DOMNode.value = mutation.newValue;
            }else{
                input.attributes.value = mutation.newValue;
            }
        }
    },
    compile: (node, binding)=>{
        let todo = binding.target.value,
            input = node.find({class:'edit'}),
            t = null;
        node.todo = todo;
        node.find('label').on('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            if(t){
                clearTimeout(t);
                store.dispatch('editing', todo);
            }else{
                t = setTimeout(()=>{t = null;}, 300);
            }
        });
        input.on('focus', (e, n)=>{
            n.DOMNode.value = n.DOMNode.value;
        });
        input.on('blur', (e, n)=>{
            store.dispatch('editing', null);
            if(n.DOMNode.value.length){
                store.dispatch('edit', todo, n.DOMNode.value);
            }else{
                store.dispatch('clear', state.todos.indexOf(todo));
            }
        });
        input.on('keyup', (e, n)=>{
            if(e.keyCode === 13){
                store.dispatch('editing', null);
                if(n.DOMNode.value.length){
                    store.dispatch('edit', todo, n.DOMNode.value);
                }
            }
            if(e.keyCode === 27){
                store.dispatch('editing', null);
            }
        });
    }
});

let editingBind = new Bind({
    update: function(node, binding){
        if(node.todo === binding.target.parent[binding.target.key]){
            node.attributes.class += ' editing';
            if(node.compiled){
                setTimeout(()=>{
                    node.find({class:'edit'}).DOMNode.focus();
                }, 10);
            }
        }else{
            node.attributes.class = node.attributes.class.replace(' editing','');
        }
    }
});

function setChecked(checkbox, completed){
    if(checkbox.compiled){
        if(checkbox.DOMNode.checked !== completed){
            checkbox.DOMNode.checked = completed;
        }
    }else{
        if(completed === true){
            checkbox.attributes.checked = null;
        }else{
            if(checkbox.attributes.checked){
                delete checkbox.attributes.checked;
            }
        }
    }
}

let todosBind = new Bind({
    bind: (node, target)=>{
        let parent = node.parent;
        node.remove();
        target.value.forEach((todo)=>{
            parent.append(renderTodo(node, todo));
        });
        return{
            node: parent,
            prop: 'parent'
        };
    },
    update: (node, binding, mutation)=>{
        //node here is ul
        //binding template is the li
        let li;
        switch (mutation.method) {
            case 'push':
                li = renderTodo(binding.template, mutation.args[0]);
                if(node.compiled){
                    node.append(compile(li));
                    li.destroy();
                }else{
                    node.append(li);
                }
                break;
            case 'splice':
                node.children.splice(mutation.args[0], mutation.args[1]);
                break;
        }
    }
});

function renderTodo(template, todo){
    let clone = template.clone(true);
    clone.find({class: 'toggle'})
        .on('change', ()=>{
            store.dispatch('toggle', state.todos.indexOf(todo));
        });
    clone.find('button')
        .on('click', ()=>{
            store.dispatch('clear', state.todos.indexOf(todo));
        });
    todoBind.render(clone, todo);
    editingBind.render(clone, state, 'editing');
    return clone;
}

class Todo extends Component{
    constructor(name, root){
        super(name, root);
    }
    parse(s){
        //these events and bindings will be cloned by parent Todos component
        super.parse(s);
        this.templates.forEach((template)=>{
            completedIf.render(template, state, 'path');
        });
    }
}

Todo.components = {};

Todo.template = '<li class="completed">\
    <div class="view">\
        <input class="toggle" type="checkbox" checked>\
        <label>Taste JavaScript</label>\
        <button class="destroy"></button>\
    </div>\
    <input class="edit" value="Create a TodoMVC template">\
</li>';

class Todos extends Component{
    constructor(name, root){
        super(name, root);
    }
    parse(s){
        super.parse(s);
        this.templates.forEach((template)=>{
            let li = template.find('li');
            todosBind.render(li, state, 'todos');
        });
    }
}

Todos.components = {
    todo: Todo
};

Todos.template = '<ul class="todo-list">\
    <todo></todo>\
</ul>';

let newTodoBind = new Bind({
    compile: (node, binding)=>{
        node.on('keyup', (e, input)=>{
            if(e.keyCode === 13){
                store.dispatch('add', input.DOMNode.value);
                binding.target.parent[binding.target.key] = '';
            }
        });
    },
    update: (node, binding, mutation)=>{
        if(node.compiled){
            node.DOMNode.value = mutation.newValue;
        }
    }
});

let activeBind = new Bind({
    bind: activeCount,
    update: activeCount
});

function activeCount(node, binding){
    let target = binding.target || binding;
    node.children[0].text = target.parent[target.key];
}

let clearIfBind = new If(()=>{
    return state.active < state.todos.length;
});

let activeLinkBind = new Bind({
    bind: activeLink,
    update: activeLink
});

function activeLink(node, binding){
    let target = binding.target || binding,
        path = `#/${target.parent[target.key]}`;
    if(node.attributes.href === path){
        if(node.compiled){
            if(!node.attributes.class){
                node.attributes.add('class', 'selected');
                return;
            }
        }
        node.attributes.class = 'selected';
    }else{
        if(node.compiled){
            if(node.attributes.class){
                node.attributes.delete('class');
            }
        }else{
            if(node.attributes.class){
                delete node.attributes.class;
            }
        }
    }
}

let toggleAllBind = new Bind({
    bind: function(node){
        node.on('change', (e, node)=>{
            store.dispatch('toggle', true, node.DOMNode.checked);
        });
        setChecked(node, state.active === 0);
    },
    update: function(node){
        setChecked(node, state.active === 0);
    }
});

class App extends Component{
    constructor(){
        super('app');
    }
    parse(s){
        super.parse(s);
        this.templates.forEach((template)=>{
            let footer = template.find('footer'),
                clear = footer.find({class:'clear-completed'});
            activeLinkBind.render(footer.filter('a'), state, 'path');
            newTodoBind.render(template.find('input'), newTodo, 'text');
            lengthIf.render(footer, state, 'todos');
            activeBind.render(footer.find('strong'), state, 'active');
            toggleAllBind.render(template.find({class: 'toggle-all'}), state, 'active');
            clear.on('click', ()=>{
                store.dispatch('clear', true);
            });
            clearIfBind.render(clear, state, 'active');
        });
    }
}

App.components = {
    'todos': Todos
};

var app = new App();

router.start();