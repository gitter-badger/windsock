var Signals = require('./signals'),
    util = require('./util'),
    lowerCase = util.lowerCase,
    extend = util.extend,
    each = util.each,
    is = util.is;

var voidTags = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];

var ignoreTags = [
    'script'
];

function parseTag (tag){

    var node = createNode(),

    reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g;

    var m = tag.match(reg);

    if(m.length > 1){

        node.attributes = Object.create(null);

    }

    for(var i = 0, l = m.length; i < l; i++){

        var keyVal = m[i].split('=');

        if(i === 0) {

            //node.name = keyVal[0].replace('/','').replace('>','').trim();
            node.name = keyVal[0].replace(/[\/>]/g, '').trim();

        }else if(keyVal.length > 1){

            node.attributes[keyVal[0].trim()] = keyVal[1].replace(/["'>]/g, '').trim();

        }else{

            node.attributes[keyVal[0].replace(/[>]/g, '').trim()] = null;

        }

    }

    return node;

}

function isVoid(tag){

    for(var i = 0, l = voidTags.length; i < l; i++){

        if(voidTags[i] === tag) return true;

    }

    return false;

}

function createNode(){

    return Object.create(null, {

        name: {

            value: '',
            enumerable: true,
            writable: true

        }

    });

}

Parser.signals = ['start', 'content', 'end', 'done'];

//doesn't support xml namespaces, any type of fuzzy/predictive syntax,
//error handling, doctypes, optional closures or anything a real parser would
function Parser(callbacks){

    var selfie = this;

    //parseHTML signals
    each(Parser.signals, function(name){

        selfie[name] = new Signals; //woa i don't even need parens

        if(typeof callbacks !== 'undefined' && typeof callbacks[name] !== 'undefined'){

            selfie[name].add(callbacks[name], selfie);

        }

    });

}

Parser.prototype.parse = function(obj){

    if(!obj) return;

    if(is(obj, 'string')){

        //treat as html
        return this.parseHTML(obj);

    }else if(obj.nodeName){

        //html element
        return this.parseDOM(obj);

    }else{

        //assume a jsonml object
        return this.parseJSONML(obj);

    }

};

Parser.prototype.parseDOM = function(element){

    //heavy dom read operations

    if(ignoreTags.indexOf(lowerCase(element.nodeName)) !== -1) return;

    var node = createNode();

    node.name = lowerCase(element.nodeName);

    node.documentElement = element;

    if(element.attributes.length){

        node.attributes = {};

        each(element.attributes, function(attribute, index){

            node.attributes[attribute.name] = attribute.value;

        });

    }

    if(!isVoid(node.name)) this.start.dispatch(node);

    if(element.hasChildNodes()){

        var childNodes = element.childNodes;

        for (var i = 0; i < childNodes.length; i++) {

            if(childNodes[i].nodeType == 1){

                this.parseDOM(childNodes[i]);

            }else if(childNodes[i].nodeType == 3) {

                this.content.dispatch(childNodes[i].nodeValue);

            }

        }

    }

    if(node.attributes && !isVoid(node.name)) delete node.attributes;

    this.end.dispatch(node, isVoid(node.name));

};

Parser.prototype.parseJSONML = function(jsonml){

    var i = 1, node;

    if((is(jsonml[0], 'array') || is(jsonml[0], 'object')) && typeof jsonml[0].length !== 'undefined'){

        this.parseJSONML(jsonml[0]);

    }else{

        node = createNode();

        node.name = jsonml[0];

        if(is(jsonml[1], 'object')){

            i++;
            node.attributes = extend(Object.create(null), jsonml[1]);

        }

        if(!isVoid(node.name)){

            this.start.dispatch(node);

        }

    }

    while(i < jsonml.length){

        if(is(jsonml[i], 'string')){

            this.content.dispatch(jsonml[i]);

        }else{

            this.parseJSONML(jsonml[i]);

        }

        i++

    }

    if(typeof node === 'undefined') return;

    if(node.attributes && !isVoid(node.name)) delete node.attributes;

    this.end.dispatch(node, isVoid(node.name));

};

Parser.prototype.parseHTML = function(markup){

    if(!markup) return;

    //nodejs buffer and remove all line breaks = dirty
    markup = markup.toString().replace(/\n/g,'').replace(/\r/g,'');

    while(markup){

        var nextTagIndex = markup.indexOf('<');

        if(nextTagIndex >= 0 ){

            //start element exists in string
            if(nextTagIndex > 0) this.content.dispatch(markup.substring(0, nextTagIndex));

            //set html string to index of new element to end
            markup = markup.substring(nextTagIndex);

            //grab the start tag
            var endOfTagIndex = markup.indexOf('>') + 1,
                startTag = markup.substring(0, endOfTagIndex),
                parsedTag = parseTag(startTag),
                //if not xhtml void tag check tagname for html5 valid void tags
                voidTag = (markup[startTag.length - 2] === '/') || isVoid(parsedTag.name);

            if(startTag[1] === '!'){

                //comment, ignore?
                endOfTagIndex = markup.indexOf('-->') + 1;

            }else if(startTag[1] === '/' || voidTag){

                //void tag or end tag. start is never called for void tags
                this.end.dispatch(parsedTag, voidTag);

            }else{

                //start tag
                this.start.dispatch(parsedTag);

            }

            // substring to end of tag
            markup = markup.substring(endOfTagIndex);

        }else{

            this.content.dispatch(markup);

            //reset
            markup = null;

        }

    }

    return this.done.dispatch();

};

module.exports = Parser;
