#windsock.js <img width="88" src="https://raw.githubusercontent.com/bsawyer/windsock-artwork/master/windsock_2x.png">
[![Build Status](https://travis-ci.org/bsawyer/windsock.svg)](https://travis-ci.org/bsawyer/windsock)

JSONML compliant observable virtual DOM

API

Methods

windsock.parse(source)

source String|Array|DocumentElement
String is treated as HTML
Array is treated as JSONML
DocumentElement is cloned but ref to the original is maintained

returns virtual DOM Element|Fragment|Text

//it is possible to either treate this virtual

windsock.compile(node)
node is a virtual DOM node
returns new virtual DOM node with compiled documentNodes

windsock.render(node)
transcludes root documentNode if live dom element exists
returns compiled node root documentNode

Virtual DOM Nodes - Inherit from Node

Methods

Properties

Node

var txt = windsock.node.text('asd')
windsock.node.clone(t)
txt.clone()

var coolDiv = new Node.Element('div', {class:'cool'}, [new Node.Text('cool text')]);
              windsock.parse('<div class="cool">cool text</div>');

var clone = windsock.parse(coolDiv.jsonml)
clone.traverse(createRealDomNodeAndBatchObserveMutation)

var myCoolDiv = windsock.compile(coolDiv);

windsock.render(myCoolDiv, document.body);

myCoolDiv.append(windsock.parse('some text'))
myCoolDiv.append(txt)
myCoolDiv.attributes.add('id', 'doit')
myCoolDiv.children.pop() //this will be observed and batched
myCoolDiv.name -> myCoolDiv.name._value.name.value

myCoolDiv._value = {
    name:'',
    attributes: {},
    children: []
}
