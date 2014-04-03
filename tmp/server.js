var windsock = require('../src/windsock'),
    Data = require('../src/data');

var toDoList = {
    title: 'todos',
    todos: [
        {
            done: true,
            content: 'Learn JavaScript'
        },
        {
            done: false,
            content: 'Learn windsock.js'
        }
    ]
};

//simulate fs.read
var demo = '<div id="demo"><h1>{{title | uppercase}}</h1><ul><li v-repeat="todos" v-on="click: done = !done" class="done">{{content}}</li></ul></div>';

var bindings = [{
    markup: 'h1',
    data: 'title'
}];

var ws = new windsock({

    data: toDoList,
    markup: demo,
    bindings: bindings

});

var h1 = ws.find({attributes:{id:'demo'}});

console.log(h1);

console.log('end of server code');
