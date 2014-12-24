var util = require('./util'),
    //batch = require('./batch'),
    //Observer = require('./observer'),
    Text = require('./node/Text'),
    Element = require('./node/element'),
    each = util.each;

function compile(node){

    if(!node._documentNode){

        if(node instanceof Element){

            node._documentNode = document.createElement(node.name);

            if(node.attributes) {

                each(node.attributes, function(val, key){

                    node._documentNode.setAttribute(key, val);

                });

            }

        }else if(node instanceof Text){

            node._documentNode = document.createTextNode(node.value);

        }

    }

    if(node.children){

        each(node.children, function(n){

            node._documentNode.append(compile(n));

        });

    }

    node._compiled = true;

    return node;
}

module.exports = {

    compile: function(node){

        node.observers.add(function(){



        });

        //if node has _documentNode it will be where we transclude
        compile(node);


    },

    transclude: function(){

    }
};
