import {Bind} from 'windsock';
import state from '../../../core/state'

export default new Bind((node)=>{
    setChecked(node, (state.active === 0 && state.todos.length));
});

function setChecked(checkbox, value){
    if(checkbox.compiled){
        checkbox.DOMNode.checked = value;
    }
}