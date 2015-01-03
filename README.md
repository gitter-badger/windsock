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
```

## Methods
### windsock.parse()
The parse method is used to create and return an uncompiled virtual DOM. It takes either an HTML string, JSONML Array, or DocumentElement.
```javascript
var ul = windsock.parse(document.getElementById('transcludeMe'))
```

### windsock.compile()
The compile method is used for compiling a parsed virtual DOM. It returns an observable, JSONML compliant deep clone of the virtual DOM and its events.
```javascript
var observableList = windsock.compile(ul)
```

### windsock.transclude()
The transclude method is used to replace the original live node with the virtual compiled node.
```javascript
windsock.transclude(observableList);
```

### windsock.html()
The html method is used to take a compiled virtual DOM and return and HTML string.
```javascript
windsock.html(observableList);
```

##Utility
windsock.Observer

windsock.Batch

windsock.util
