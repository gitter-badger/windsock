var is = require('../util').is,
    node = require('../node'),
    parser = require('./index');

module.exports = function parse(source){

    var method,
        parsed,
        DOMNode;

    if(is(source, 'string')){

        method = parser.parseHTML;

    }else if(source.nodeName){

        if(document.contains(source)){

            DOMNode = source; //retain for transcluding
            source = source.cloneNode(true); //going to be doing some heavy reads...

        }

        method = parser.parseDOM;

    }else{

        method = parser.parseJSONML;

    }

    method(source, function(e){

        switch(e.type){

            case 'text':

                //if parsed is undefined create fragment and append to that - nix
                if(!parsed){

                    parsed = node.text(e.value); //will break if more

                }else{

                    parsed.append(node.text(e.value));

                }

            break;

            case 'start':

                if(parsed) {

                    parsed.append(node.element(e.name, e.attributes));
                    parsed = parsed.children[parsed.children.length - 1];

                }else{

                    parsed = node.element(e.name, e.attributes);

                }

            break;

            case 'end':

                if(e.void){

                    parsed.append(node.element(e.name, e.attributes));

                }else{

                    if(parsed.parent) parsed = parsed.parent;
                    //scenario where text is last event so we don't have a parent

                }

            break;

        }

    });

    source = null;

    if(DOMNode) parsed._transclude = DOMNode;

    return parsed;

};
