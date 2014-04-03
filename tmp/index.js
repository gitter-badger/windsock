var Signals = require('../src/signals');
var data = require('../src/data');

var cool = {cat:'asd'};

//create an extended signal with scoped ref to object which all signals will have

var mySignal = Signals.Signal.extend({

    cat: cool,
    _flush: function(){

    }

}, function(fn){

    this._signal = fn;

});

var characters = new mySignal(function(done){

    done();

});

var someSignal = new Signals();

someSignal.add(characters);

someSignal();


//-----------------------------------
var toDoList = {

    title: 'todos',

    literal: {

        prop: 'key'

    },

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

data(toDoList);


data.observe(toDoList, 'literal', function(method, prop, parent){

    if(method == 'get') return;

    console.log('observing ' + method + ' of toDoList.literal');
    console.log(this.value);
    console.log(this.value.prop);

});

data.observe(toDoList.literal, 'prop', function(method, prop, parent){

    if(method == 'get') return;

    console.log('observing ' + method + ' of toDoList.literal.prop');
    console.log(this.value);

});

data.mutate(toDoList, 'literal', function(obj){

    console.log(obj == toDoList.literal);
    obj = {cat: 'asd'};
    console.log(obj);
    //console.log(obj.prop);
    //return 'prop';

    //obj.prop = 'asd'; //works, calls set

});

// toDoList.literal = {
//     cat: 'asd'
// };

//console.log(toDoList.literal.prop);

console.log('end');
