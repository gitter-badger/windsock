var util = require('./util'),
    node = require('./node'),
    parser = require('./parser'),
    compiler = require('./compiler'),
    is = util.is;

function attributesToString(attr){

    var attribute = '';

    for(var key in attr){

        attribute += ' ' + key;

        if(attr[key]) attribute+= '="' + attr[key] + '"';

    }

    return attribute;

}

var windsock = {

    util: util,

    parse: function(source){

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

            var n;

            switch(e.type){

                case 'text':

                    parsed.append(node.text(e.value));

                break;

                case 'start':

                    n = node.element(e.name, e.attributes);
                    if(parsed) parsed.append(n);
                    parsed = n;

                break;

                case 'end':

                    if(e.void){

                        parsed.append(node.element(e.name, e.attributes));

                    }else{

                        if(parsed.parent) parsed = parsed.parent;

                    }

                break;

            }

            n = null;

        });

        source = null;

        if(DOMNode) parsed._documentNode = DOMNode;

        return parsed;

    },

    compile: function(node){

        var clone = node.clone();
        compiler.compile(clone);
        return clone;

    },

    render: function(node){

        //optionally clone?
        return compiler.transclude(node);

    },

    jsonml: function(node){

        return JSON.stringify(node);

    },

    html: function(node){

        if(!node || !node._jsonml.length) return '';

        var html = [];

        parser.parseJSONML(node._jsonml, function(e){

            switch(e.type){

                case 'text':

                    html.push(e.value);

                break;

                case 'start':

                    html.push('<' + e.name + attributesToString(e.attributes) + '>');

                break;

                case 'end':

                    if(e.void){

                        html.push('<' + e.name + attributesToString(e.attributes) + '/>');

                    }else{

                        html.push('</' + e.name + '>');

                    }

                break;

            }

        });

        return html.join('');

    }

};

windsock.node = node;

module.exports = windsock;
