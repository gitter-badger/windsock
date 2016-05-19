import {Bind} from 'windsock';

const DISPLAY_NONE = 'display:none;';

export default class Conditional extends Bind{
    constructor(predicate, remove = false){
        super((node, binding)=>{
            let target = binding.target || binding;
            this.predicate(node, target) ? this.show(node) : this.hide(node);
            return{
                node: node,
                prop: remove ? 'node' : 'style'
            };
        });
        this.predicate = predicate;
        this.remove = remove;
    }
    show(node){
        if(this.remove){
            node.lastParent && node.lastParent.append(node);
        }else{
            if(node.attributes.style){
                node.attributes.style = node.attributes.style.replace(DISPLAY_NONE, '');
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
            if(node.attributes.style && node.attributes.style.indexOf(DISPLAY_NONE) !== -1){
                return;
            }
            if(typeof node.attributes.style !== 'undefined'){
                node.attributes.style += DISPLAY_NONE;
            }else{
                if(node.compiled){
                    node.attributes.add('style', DISPLAY_NONE);
                }else{
                    node.attributes.style = DISPLAY_NONE;
                }
            }
        }
    }
}