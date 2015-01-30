#windsock.js <img width="88" src="https://raw.githubusercontent.com/bsawyer/windsock-artwork/master/windsock_2x.png">
[![Build Status](https://travis-ci.org/bsawyer/windsock.svg)](https://travis-ci.org/bsawyer/windsock)

Observable JSONML compliant virtual DOM

## tldr;
```javascript
var todoTemplate = windsock.parse('<ul><li>buy milk</li></ul>').children[0];

var li = todoTemplate.find('li').clone();

li.text = 'call mom';

todoTemplate.append(li);

todoTemplate.filter('li').forEach(function(item){
    item.on('click', function(){
        if(!this.attributes.class){
            this.attributes.add('class', 'done');
        }else if(this.attributes.class === 'done'){
            this.attributes.class = 'to-do';
        }else{
            this.attributes.class = 'done';
        }
    })
});

var compiled = windsock.compile(todoTemplate);

windsock.transclude(compiled, document.querySelector('.replace-ul'));
```

## Methods
### windsock.parse()
The parse method is used to create and return an uncompiled virtual DOM fragment. It takes either an HTML string, JSONML Array, or DocumentElement.
```javascript
var ul = windsock.parse(document.getElementById('transcludeMe'))
```

### windsock.compile()
The compile method is used for compiling a parsed virtual DOM node. It returns an observable, JSONML compliant deep clone of the virtual DOM and its events.
```javascript
var observableList = windsock.compile(ul)
```

### windsock.transclude()
The transclude method is used to replace the original live node with the virtual compiled node.
```javascript
windsock.transclude(observableList);
```

### windsock.html()
The html method is used to take a compiled virtual DOM and return an HTML string.
```javascript
windsock.html(observableList);
```

##Utility
windsock.Observer

windsock.Batch

windsock.util
