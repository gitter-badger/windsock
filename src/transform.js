import Signal from './signal';

export default class Transform{
    constructor(){
        this.bind = new Signal();
        this.update = new Signal();
    }
}
