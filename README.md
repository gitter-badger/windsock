#windsock.js <img width="88" src="https://raw.githubusercontent.com/bsawyer/windsock-artwork/master/windsock_2x.png">
[![Build Status](https://travis-ci.org/bsawyer/windsock.svg)](https://travis-ci.org/bsawyer/windsock)
Observable JSONML compliant virtual DOM
## tldr;
```javascript
var todo = windsock.parse('<ul><li>buy milk</li></ul>');
var li = todo.find('li')[0].clone();
li.text = 'call mom';
todo.append(li);

var compiled = windsock.compile(todo);
compiled.find('li').forEach(function(li){
    li.on('click', function(){
        if(!this.attributes.class){
            this.attributes.add('class', 'done');
        }else if(this.attributes.class === 'done'){
            this.attributes.class = 'to-do';
        }else{
            this.attributes.class = 'done';
        }
    })
});

document.body.appendChild(compiled.render());
## API

windsock.parse
```javascript
var ul = windsock.parse(document.getElementById('transcludeMe'))

windsock.compile
```javascript
var observableList = windsock.compile(ul)

windsock.transclude
```javascript
windsock.transclude(observableList);

windsock.Observer

windsock.Batch

windsock.html

windsock.util
