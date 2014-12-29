var util = require('./util'),
    //batch = require('./batch'),
    //Observer = require('./observer'),
    Text = require('./node/Text'),
    Element = require('./node/element'),
    each = util.each;

function compile(node){

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

    if(node.children){

        each(node.children, function(n){

            node._documentNode.appendChild(compile(n)._documentNode);

        });

    }

    node._compiled = true;

    return node;
}

module.exports = {

    compile: function(node){

        return compile(node);

    },

    transclude: function(node){

        //one off action, nullifies transclude

        var parent = node._transclude.parentNode;

        parent.insertBefore(node._documentNode, node._transclude);

        parent.removeChild(node._transclude);

        node._transclude = null;

    }
};
