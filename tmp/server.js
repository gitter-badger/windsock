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

//binding selectors
var bindings = [{

    markup: 'h1',
    data: 'title',
    events:{
        click: function(node, obj){
            //called on h1 click
            //obj.title = 'something else';
            //whatever is done in here should be decoupled for testing purposes for a specific application
        },
        update: function(){
            //called on model update
        }
    }

}];

var ws = new windsock({

    data: toDoList,
    markup: demo,
    bindings: bindings

});

//extend default binding functions
var app = windsock.extend({
    bindings:{
        data: function(selector){
            //this function is used to iterate over data
        },
        markup: function(selector, nodeVal, nodeIdnex, node){

        }
    }
});

var h1 = ws.find({attributes:{id:'demo'}});

console.log(h1);

console.log('end of server code');
