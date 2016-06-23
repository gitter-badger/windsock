import {Bind} from 'windsock';
import state from '../../core/state';
import store from '../../core/store';

export default new Bind({
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
            prop: 'node'
        };
    },
    update: (node, binding, mutation)=>{
        let checkbox = node.find({class: 'toggle'}),
            input = node.find({class: 'edit'});

        if(mutation.type === 'completed'){
            node.attributes.class = mutation.newValue ? 'todo completed' : 'todo';
            if(checkbox.compiled){
                if(checkbox.DOMNode.checked !== mutation.newValue){
                    checkbox.DOMNode.checked = mutation.newValue;
                }
                if(state.route === 'active' && mutation.newValue || state.route === 'completed' && !mutation.newValue){
                    node.attributes.style = 'display:none;';
                }else{
                    node.attributes.style = node.attributes.style && node.attributes.style.replace('display:none;','');
                }
            }

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
                t = null;
            }else{
                t = setTimeout(()=>{t = null;}, 450);
            }
        });
        node.find({class: 'toggle'}).on('change', (e, n)=>{
            store.dispatch('toggle', state.todos.indexOf(todo));
        });
        node.find('button').on('click', (e, n)=>{
            store.dispatch('clear', state.todos.indexOf(todo));
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
                e.preventDefault();
                e.stopPropagation();
                store.dispatch('editing', null);
            }
        });
    }
});

function setChecked(checkbox, value){
    if(checkbox.compiled){
        if(checkbox.DOMNode.checked !== value){
            checkbox.DOMNode.checked = value;
        }
    }else{
        if(value === true){
            checkbox.attributes.checked = null;
        }else{
            if(checkbox.attributes.checked){
                delete checkbox.attributes.checked;
            }
        }
    }
}