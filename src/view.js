var util = require('./util'),
    Node = require('./node'),
    Parser = require('./parser'),
    Batch = require('./batch'),
    traverse = util.traverse,
    each = util.each,
    is = util.is;

function View(obj){

    //private ref to virtual node
    this._node = null;
    this._batch = new Batch;

    if(obj) this._parse(obj);

}

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

View.prototype.fragment = function(){

    return this._node;

};

View.prototype.html = function(){

    if(!this._node) return;

    var html = [],
        parser = new Parser;

    parser.start.add(function(node){

        html.push('<' + node.name);

        if(node.attributes){

            each(node.attributes, function(key, value){

                if(value) value = '="' + value + '"';
                html.push(' ' + key + value);

            });

        }

        html.push('>');

    });

    parser.content.add(function(text){

        html.push(text);

    });

    parser.end.add(function(node, isVoid){

        if(isVoid){

            html.push('<' + node.name);

            if(node.attributes){

                each(node.attributes, function(key, value){

                    if(value) value = '="' + value + '"';
                    html.push(' ' + key + value);

                });

            }

            html.push('/>');

        }else{

            html.push('</' + node.name + '>');

        }

    });

    parser.parse(this._node);

    return html.join('');

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
