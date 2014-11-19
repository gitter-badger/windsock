var util = require('./util'),
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
    ],

    ignoreTags = [
        'script'
    ];

function isVoid(name){

    for(var i = 0, l = voidTags.length; i < l; i++){

        if(voidTags[i] === name) return true;

    }

    return false;

}

function eventValueObject(options){

    return extend({

        type: null

    }, options || {});

}

function hasChildren(source, callback){

   if(source.hasChildNodes()){

       var childNodes = source.childNodes;

       for (var i = 0, l = childNodes.length; i < l; i++) {

           parseDOM(childNodes[i], callback);

       }

   }

}

//cloneNode prior to avoid heavy dom reads
function parseDOM(source, callback){

    var node;

    if(ignoreTags.indexOf(source.nodeName.toLowerCase()) !== -1) return;

    if(source instanceof DocumentFragment){

        hasChildren(source, callback);

        return;

    }

    if(source.nodeType === 3){

        return callback(eventValueObject({

            type: 'text',

            textNode: source,

            value: source.nodeValue

        }));

    }

    node = eventValueObject({

        documentElement: source,

        name: source.nodeName.toLowerCase()

    });

    node.void = isVoid(node.name);

    if(source.attributes.length){

        node.attributes = {};

        each(source.attributes, function(attribute, index){

            node.attributes[attribute.name] = attribute.value;

        });

    }

    node.type = 'start';

    if(!node.void) callback(node);

    hasChildren(source, callback);

    if(node.attributes && !node.void) delete node.attributes;

    node.type = 'end';

    callback(node);

}

function parseJSONML(source, callback){

    var index = 1, node;

    if((is(source[0], 'array') || is(source[0], 'object')) && typeof source[0].length !== 'undefined'){

        parseJSONML(source[0], callback);

    }else{

        node = eventValueObject({

            documentElement: {},

            name: source[0]

        });

        //replaced Object.prototype check in is(source[1], 'object') with custom toString for text nodes
        if(source.length > 1 && source[1].toString() === '[object Object]'){

            index++;
            node.attributes = extend(Object.create(null), source[1]);

        }

        node.void = isVoid(node.name);

        node.type = 'start';

        if(!node.void) callback(node);

    }

    while(index < source.length){

        if(is(source[index], 'string') || source[index].value ){

            callback(eventValueObject({

                type: 'text',

                textNode: {},

                value: source.value || source[index]

            }));

        }else{

            parseJSONML(source[index], callback);

        }

        index++

    }

    if(typeof node === 'undefined') return;

    if(node.attributes && !node.void) delete node.attributes;

    node.type = 'end';

    callback(node);

}

function parseTag (tag){

    var node = eventValueObject({

        documentElement: {}

    }),

    reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g,

    match = tag.match(reg);

    if(match.length > 1) node.attributes = {};

    for(var i = 0, l = match.length; i < l; i++){

        var keyVal = match[i].split('=');

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

function parseHTML(source, callback){

    var endOfTagIndex,
        startTag,
        node;

    //nodejs buffer and remove all line breaks aka dirty
    source = source.toString().replace(/\n/g,'').replace(/\r/g,'');

    while(source){

        var nextTagIndex = source.indexOf('<');

        if(nextTagIndex >= 0 ){

            //start element exists in string
            //need to convert content to node
            if(nextTagIndex > 0) {

                callback(eventValueObject({

                    type: 'text',

                    textNode: {},

                    value: source.substring(0, nextTagIndex)

                }));

            }

            //set html string to index of new element to end
            source = source.substring(nextTagIndex);

            endOfTagIndex = source.indexOf('>') + 1;

            startTag = source.substring(0, endOfTagIndex);

            node = parseTag(startTag);

            //if not xhtml void tag check tagname for html5 valid void tags
            node.void = (source[startTag.length - 2] === '/') || isVoid(node.name);

            if(startTag[1] === '!'){

                //comment, ignore?
                endOfTagIndex = source.indexOf('-->') + 1;

            }else if(startTag[1] === '/' || node.void){

                //void tag or end tag. start is never called for void tags
                node.type = 'end';
                callback(node);

            }else{

                //start tag
                node.type = 'start';
                callback(node);

            }

            // substring to end of tag
            source = source.substring(endOfTagIndex);

        }else{

            callback(eventValueObject({

                type: 'text',

                textNode: {},

                value: source

            }));

            //reset
            source = null;

        }

    }

}

exports.parseDOM = parseDOM;
exports.parseJSONML = parseJSONML;
exports.parseHTML = parseHTML;
