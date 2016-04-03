export default class Signal{
    constructor(){
        this.listeners = [];
    }
    add(listener){
        this.listeners.push(listener);
    }
    remove(listener){
        if(listener){
            return this.listeners.splice(this.listeners.indexOf(listener),1);
        }
        this.listeners = [];
    }
    dispatch(...args){
        return this.listeners.map((listener)=>{
            return listener.apply(this, args);
        });
    }
}
