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

function isWhitespace(str){

    //tab, line feed, carriage return, and space
    return !(/[^\t\n\r ]/.test(str));

}

function clean(source){

    //removes tabs, line feeds, carriage returns, and any more than 2 or greater spaces
    return source.toString().replace(/[\t\n\r]|\s{2,}/g,'');

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

function parseTag (tag){

    var event = eventValueObject({

        documentElement: {}

    }),

    reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g,

    match = tag.match(reg);

    if(match.length > 1) event.attributes = {};

    for(var i = 0, l = match.length; i < l; i++){

        var keyVal = match[i].split('=');

        if(i === 0) {

            //event.name = keyVal[0].replace('/','').replace('>','').trim();
            event.name = keyVal[0].replace(/[\/>]/g, '').trim();

        }else if(keyVal.length > 1){

            event.attributes[keyVal[0].trim()] = keyVal[1].replace(/["'>]/g, '').trim();

        }else{

            event.attributes[keyVal[0].replace(/[>]/g, '').trim()] = null;

        }

    }

    return event;

}

//cloneNode prior to avoid heavy dom reads
function parseDOM(source, callback){

    var event;

    if(ignoreTags.indexOf(source.nodeName.toLowerCase()) !== -1) return;

    if(source instanceof DocumentFragment){

        hasChildren(source, callback);

        return;

    }

    if(source.nodeType === 3){

        if(isWhitespace(source.nodeValue) || !clean(source.nodeValue).length) return;

        return callback(eventValueObject({

            type: 'text',

            textNode: source,

            value: clean(source.nodeValue)

        }));

    }

    event = eventValueObject({

        documentElement: source,

        name: source.nodeName.toLowerCase()

    });

    event.void = isVoid(event.name);

    if(source.attributes.length){

        event.attributes = {};

        each(source.attributes, function(attribute){

            event.attributes[attribute.name] = attribute.value;

        });

    }

    event.type = 'start';

    if(!event.void) callback(event);

    hasChildren(source, callback);

    if(event.attributes && !event.void) delete event.attributes;

    event.type = 'end';

    callback(event);

}

function parseJSONML(source, callback){

    var index = 1, event;

    if((is(source[0], 'array') || is(source[0], 'object')) && typeof source[0].length !== 'undefined'){

        parseJSONML(source[0], callback);

    }else{

        event = eventValueObject({

            documentElement: {},

            name: source[0]

        });

        //replaced Object.prototype check in is(source[1], 'object') with custom toString for text nodes
        if(source.length > 1 && source[1].toString() === '[object Object]'){

            index++;
            event.attributes = extend(Object.create(null), source[1]);

        }

        event.void = isVoid(event.name);

        event.type = 'start';

        if(!event.void) callback(event);

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

        index++;

    }

    if(typeof event === 'undefined') return;

    if(event.attributes && !event.void) delete event.attributes;

    event.type = 'end';

    callback(event);

}

function parseHTML(source, callback){

    var endOfTagIndex,
        startTag,
        event;

    //nodejs buffer and remove all line breaks aka dirty
    //source = source.toString().replace(/\n/g,'').replace(/\r/g,'');
    source = clean(source);

    while(source){

        var nextTagIndex = source.indexOf('<');

        if(nextTagIndex >= 0 ){

            //start element exists in string
            //need to convert content to event
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

            event = parseTag(startTag);

            //if not xhtml void tag check tagname for html5 valid void tags
            event.void = (source[startTag.length - 2] === '/') || isVoid(event.name);

            if(startTag[1] === '!'){

                //comment, ignore?
                endOfTagIndex = source.indexOf('-->') + 1;

            }else if(startTag[1] === '/' || event.void){

                //void tag or end tag. start is never called for void tags
                event.type = 'end';
                callback(event);

            }else{

                //start tag
                event.type = 'start';
                callback(event);

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
exports.parseHTML = parseHTML;
exports.parseJSONML = parseJSONML;
