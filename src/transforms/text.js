import Transform from '../transform';

export default class TextTransform extends Transform{
    constructor(){
        super();
        this.bind.add((node, value)=>{
            node.value.textContent = value.toString();
        });
        this.update.add((node, record)=>{
            let parent;
            if(record.newValue !== record.oldValue){
                switch(record.method) {
                    case 'delete':
                        parent = node.parent;
                        node.remove();
                        node.parent = parent;
                        break;
                    case 'add':
                        if(node.parent){
                            node.parent.append(node);
                        }
                    case 'set':
                        node.value.textContent = record.newValue.toString();
                        break;
                }
            }
        });
    }
}
