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
          todos: getTodos(),
          active: 0,
          path: ''
      },
      NONE = 'display:none;',
      newTodo = {
          text: ''
      };

function getTodos(){
    let t = localStorage.getItem(TODOS);
    return t ? JSON.parse(t) : [];
}

const mutations = {
    route: function(state, path){
        state.path = path;
    },
    add: function(state, text){
        state.todos.push({
            text,
            completed: false
        });
        state.active++;
    },
    delete: function(){},
    toggle: function(state, index){
        if(index === true){
            //toggle all
        }else{
            state.todos[index].completed = !state.todos[index].completed;
            state.todos[index].completed ? state.active-- : state.active++;
        }
    },
    clear: function(state, index){
        let completed = state.todos.filter(todo=>todo.completed);
        if(index === true){
            while(completed.length){
                state.todos.splice(state.todos.indexOf(completed.pop()),1);
            }
            state.active = state.todos.length;
        }else{
            state.todos.splice(index, 1);
        }
    }
};

const store = new Store(state, mutations);

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
        let checkbox = node.find({class: 'toggle'});
        if(mutation.type === 'completed'){
            node.attributes.class = mutation.newValue ? 'todo completed' : 'todo';
            if(mutation.newValue === true && checkbox.attributes.checked){
                if(checkbox.compiled){
                    checkbox.attributes.delete('checked');
                }else{
                    delete checkbox.attributes.checked;
                }
            }
            if(mutation.newValue === false && !checkbox.attributes.checked){
                if(checkbox.compiled){
                    checkbox.attributes.add('checked', 'checked');
                }else{
                    checkbox.attributes.checked = null;
                }
            }
        }
        if(mutation.type === 'text'){
            node.find('label').children[0].text = mutation.newValue;
        }
    }
});

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
    let c = template.clone(true);
    c.find({class: 'toggle'})
        .on('change', ()=>{
            store.dispatch('toggle', state.todos.indexOf(todo));
        });
    todoBind.render(c, todo);
    completedIf.render(c, state, 'path');
    return c;
}

class Todos extends Component{
    constructor(name, root){
        super('todos', root);
    }
    parse(s){
        super.parse(s);
        this.templates.forEach((template)=>{
            let li = template.find('li');
            todosBind.render(li, state, 'todos');
        });
    }
}

Todos.components = {};

Todos.template = '<ul class="todo-list">\
    <li class="completed">\
        <div class="view">\
            <input class="toggle" type="checkbox" checked>\
            <label>Taste JavaScript</label>\
            <button class="destroy"></button>\
        </div>\
        <input class="edit" value="Create a TodoMVC template">\
    </li>\
</ul>';

let newTodoBind = new Bind({
    compile: (node, binding)=>{
        node.on('keyup', (e, input)=>{
            if(e.keyCode === 13 && node.DOMNode.value){
                store.dispatch('add', node.DOMNode.value);
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
    parse: activeCount,
    compiled: activeCount,
    update: activeCount
});

function activeCount(node, binding){
    node.children[0].text = binding.target.parent[binding.target.key];
}

let clearIfBind = new If(()=>{
    return state.active < state.todos.length;
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
            newTodoBind.render(template.find('input'), newTodo, 'text');
            lengthIf.render(footer, state, 'todos');
            activeBind.render(footer.find('strong'), state, 'active');
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