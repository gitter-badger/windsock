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
    dispatch(){
        let args = Array.prototype.slice.call(arguments);
        return this.listeners.map((listener)=>{
            return listener.apply(this, args);
        });
    }
}
