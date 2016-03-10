<img width="88" src="https://raw.githubusercontent.com/bsawyer/windsock-artwork/master/windsock_2x.png">

# windsock.js

**Flux inspired library for building web applications**

[![Build Status](https://travis-ci.org/bsawyer/windsock.svg)](https://travis-ci.org/bsawyer/windsock)

## tldr;
```javascript
//VDOM
windsock.VDOM

//Observer
var myObj = {
    myProp: 1
};
var observer = new windsock.Observer((record)=>{
    //record.method === 'set'
    //record.type === 'myProp'
    //record.oldValue === 1
    //record.newValue === 2
});
observer.observe(myObj);
myObj.myProp = 2;

//Bind
windsock.Bind

//Store
windsock.Store

//Component
windsock.Component
```
