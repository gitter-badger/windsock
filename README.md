<img width="88" src="https://raw.githubusercontent.com/bsawyer/windsock-artwork/master/windsock_2x.png">

# windsock.js

**Flux inspired library for building web applications**

[![Build Status](https://travis-ci.org/bsawyer/windsock.svg)](https://travis-ci.org/bsawyer/windsock)

## tl;dr
```javascript
var myObj = {
    myProp: 1,
    myValue: 'hello world'
};
var template = windsock.parse('<div>hello mom</div>');
var transform = new windsock.transforms.TextTransform();
var bind = new windsock.Bind('myValue', transform);
bind.render(template.children[0], myObj);
var compiled = windsock.compile(template);
windsock.transclude(compiled, document.getElementById('myId'));
myObj.myValue = 'hello windsock';
```
