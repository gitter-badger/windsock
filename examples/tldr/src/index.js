import {
    clone,
    Bind,
    Component,
    Observer,
    Store
} from 'windsock';

const state = {
    awesome: true
}

let observer = new Observer((mutation)=>{
    console.log(mutation.newValue, mutation.oldValue);
});

observer.observe(state);

state.awesome = false;
state.delete('awesome');

let mutations = {
    add: (state, id, user)=>{
        state.add(id, user);
    }
};

let store = new Store(state, mutations);

store.dispatch('add', 1, {name:'Mr. Meeseeks'});

const bind = new Bind({
    bind: (node, target)=>{
        let li = node.children[0],
            c;

        for(let id in target.value){
            c = clone(li, true);
            c.children[0].text = target.value[id].name;
            node.append(c);
        }
    },
    compile: (node, binding)=>{
        node.children[0].on('click', ()=>{
            setTimeout(()=>{
                store.dispatch('add', node.children.length, {name:'Mr. Meeseeks'});
            }, 1000);
        });
    },
    update: (node, binding, mutation)=>{
        let c;

        switch (mutation.method) {
            case 'add':
                c = clone(node.children[0], true);
                c.children[0].text = mutation.newValue.name;
                node.append(c)
                break;
            case 'delete':
                break;
            case 'set':
                break;
        }
    }
});

const template = '<ul><li>add user</li></ul>';

const options = {
    selectors: {
        name: 'users',
        compile: 'ul'
    },
    template,
};

class Users extends Component{
    constructor(){
        super(options);
    }
    parse(template){
        bind.render(template, state);
    }
}

let users = new Users();