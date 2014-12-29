var util = require('./util'),
    Batch = require('./batch'),
    //Observer = require('./observer'),
    Text = require('./node/Text'),
    Element = require('./node/element'),
    each = util.each,
    is = util.is;

function addEvent(){

    var node = this;

    each(Array.prototype.slice.call(arguments), function(event){

        node._documentNode.addEventListener(event, function compiledNodeDispatch(e){

            node._dispatch(event, e);

        });

    });


}

function removeEvent(event){

    var node = this;

    node._documentNode.removeEventListener(event);

}

function compile(node){

    if(node instanceof Element){

        node._documentNode = document.createElement(node.name);

        if(node.attributes) {

            each(node.attributes, function(val, key){

                node._documentNode.setAttribute(key, val);

            });

        }

        node.observe('attributes', function(mutation){

            switch(mutation.type){
                case 'add':
                case 'update':
                    this._documentNode.setAttribute(mutation.name, mutation.object[mutation.name]);
                break;
                case 'delete':
                    this._documentNode.removeAttribute(mutation.name);
                break;
            }

        });

        node.observe('children', function(mutation){

            switch(mutation.type){

                case 'push':

                    each.call(this, mutation.transformed, function(n){

                        this._documentNode.appendChild(n._documentNode);

                    });

                break;

                case 'slice':

                    

                break;
            }

        });

    }else if(node instanceof Text){

        node._documentNode = document.createTextNode(node.value);

        //scope this callback to node as context not node.value
        node.observe(function(mutation){

            if(mutation.name === 'value'){

                node._batch.add(function(){

                    node._documentNode.textContent = mutation.object.value;

                });

            }

        });

    }

    if(node.children){

        each(node.children, function(n){

            node._documentNode.appendChild(compile(n)._documentNode);

        });

    }

    if(!is(node.events, 'empty')) addEvent.apply(node, Object.keys(node.events));

    node.observe('events', function(mutation){

        switch(mutation.type){

            case 'add':
                addEvent.call(this, mutation.name);
            break;
            case 'delete':
                removeEvent.call(this, mutation.name);
            break;

        }

    });

    node._batch = new Batch();

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
