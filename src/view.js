var util = require('./util'),
    node = require('./node'),
    parser = require('./parser'),
    Observer = require('./observer'),
    Batch = require('./batch'),
    traverse = util.traverse,
    bind = util.bind,
    each = util.each,
    is = util.is;

//Instance of view is a jsonml spec compliant virtual dom
//Mutations on nodes are observed and batched for dom manipulation
//API:
//var jsonml = View.parser.parse(source)
//Parses markup source and converts it to an array
//
//View.compile(jsonml)
//Compiles observers to batch changes

//var fragment = View.render(jsonml)
//Compiles and returns the parent document fragment

function View(obj){}

View.parser = parser;

function bind(element){

    if(!element.name && !element.value && element.length){

        each(element, View.parser.bind);

    }

    Observer.observe(element);

}

function parse(e){

    if(!this.active) this.active = this;
    if(!this.parent) this.parent = this;

    switch(e.type){

        case 'text':
            this.active.push(node.text(e.value, e.textNode));
            break;
        case 'start':
            this.parent = this.active;
            this.active = this.active[this.active.push(node.element(e.name, e.attributes, e.documentElement)) - 1];
            break;
        case 'end':
            if(e.void){
                this.active.push(node.element(e.name, e.attributes, e.documentElement));
            }else{
                //set active to parent
                this.active = this.parent;
            }
            break;

    }

};

//Determines which method to use for parsing
//cloneNode is used for DOM nodes
//documentNodes are created for string and array source types
//parent node is appended to a documentFragment
//returns virtualdom
View.parser.parse = function(source){

    var virtualDOM = node.fragment(document.createDocumentFragment()),
        method;

    if(is(source, 'string')){

        method = 'parseHTML';

    }else if(source.nodeName){

        method = 'parseDOM';
        source = source.cloneNode();

    }else{

        method = 'parseJSONML';

    }

    View.parser[method].call(undefined, source, bind(parse, virtualDOM));

    delete virtualDOM.active;
    delete virtualDOM.parent;

    return virtualDOM;

};

View.prototype._compile = function(){

    //traverse this._node
    //add observers to each element to batch changes to dom nodes
    traverse.call(this, this._node, function compileView(value){

        console.log(value);

    });

};

View.prototype._parse = function(obj){

    //parse the obj and convert to virtual dom at this._node
    //takes anything compatible with parser.parse
    //a node list
    //or an array of anything compatible with parser.parse

    var parser = new Parser,
        dom = typeof obj.nodeName !== 'undefined',
        createElement,
        setActive,
        active,
        parent;



    parser.start.add(function(node){

        node = Node.element(node);

        if(is(node.documentNode, 'empty') && !dom){
            node.documentNode = document.createElement(node.name);
            if(node.attributes){
                each(node.attributes, function(value, key){
                    node.documentNode.setAttribute(key, value);
                })
            }
        }

        node.attributes._observers.add( function(mutation){

            if(mutation.method == 'remove'){

                this.documentNode.removeAttribute(mutation.args[0]);

            }else{

                this.documentNode.setAttribute(mutation.args[0], mutation.args[1]);

            }

        }, node);

        if(!this._node){

            active = this._node = node;

        }else{

            active.push(node);

            parent = active;

            active = active[active.length - 1];

        }



        if(!dom) active.documentNode.appendChild(node.documentNode);



    }, this);

    parser.content.add(function(text){

        text = Node.text(text);

        if(!dom){

            text.textNode = document.createTextNode(text.nodeValue);

        }

        text._observers.add( function(mutation){

            console.log('here');

            if(mutation.method == 'remove'){

                //remove text node

            }else{

                this.textNode.nodeValue = mutation.value;

            }

        }, text);

        active.push(text);

        if(!dom) active.documentNode.appendChild(text.textNode);

    });

    parser.end.add(function(node, isVoid){

        if(isVoid){

            node = Node.element(node);

            if(is(node.documentNode, 'empty') && !dom){
                node.documentNode = document.createElement(node.name);
                if(node.attributes){
                    each(node.attributes, function(value, key){
                        node.documentNode.setAttribute(key, value);
                    })
                }
            }

            active.push(node);

            if(!dom) active.documentNode.appendChild(node.documentNode);

        }else{

            active = parent;

        }

    });

    parser.done.add(function(){

        parser.reset();
        parser = null;

    });

    parser.parse(obj);

};



View.prototype.json = function(){

    if(!this._node) return;

    return JSON.stringify(this._node, function jsonReplacer(key, value){

        if(value.nodeValue){

            return value.toString();

        }

        return value;

    });

};

View.prototype.find = function(query, target){

    var self = this, result = [];

    target = target || this._node;

    if(is(query, 'object')){

        each(target, function viewFind(element){

            var match = true;

            if(!element.attributes) return;

            each(query, function(value, key, q, halt){

                if(!element.attributes[key] || element.attributes[key] !== value){

                    match = false;
                    return halt;

                }

            });

            if(match) result.push(element);

            if(element.children.length){

                result = result.concat(self.find(query, element.children));

            }

        });

    }

    return result;

};

module.exports = View;
