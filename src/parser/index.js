import {is, extend} from '../util';

const VOID_TAGS = [
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

const IGNORE_TAGS = [
    'script'
];

function isVoid(name){
    for(let i = 0, l = VOID_TAGS.length; i < l; i++){
        if(VOID_TAGS[i] === name) return true;
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

function hasChildren(source, callback){
    if(source.hasChildNodes()){
        var childNodes = source.childNodes;
        for (var i = 0, l = childNodes.length; i < l; i++) {
            parseDOM(childNodes[i], callback);
        }
    }
}

function parseTag(tag){
    var evt = {},
        reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)=["']([^"']+)["'])/g,
        match = tag.match(reg);
    if(match.length > 1) evt.attributes = {};
    for(let i = 0, l = match.length; i < l; i++){
        var keyVal = match[i].split('=');
        if(i === 0) {
            //evt.name = keyVal[0].replace('/','').replace('>','').trim();
            evt.name = keyVal[0].replace(/[\/>]/g, '').trim();
        }else if(keyVal.length > 1){
            evt.attributes[keyVal[0].trim()] = keyVal[1].replace(/["'>]/g, '').trim();
        }else{
            evt.attributes[keyVal[0].replace(/[>]/g, '').trim()] = null;
        }
    }
    return evt;
}

//cloneNode prior to avoid heavy dom reads
export function parseDOM(source, callback){
    var evt;
    if(IGNORE_TAGS.indexOf(source.nodeName.toLowerCase()) !== -1) return;
    if(source instanceof DocumentFragment){
       hasChildren(source, callback);
       return;
    }
   if(source.nodeType === 3){
       if(isWhitespace(source.nodeValue) || !clean(source.nodeValue).length) return;
       return callback({
           type: 'text',
           textNode: source,
           value: clean(source.nodeValue)
       });
   }
   evt = {
       documentElement: source,
       name: source.nodeName.toLowerCase(),
       void: isVoid(source.nodeName.toLowerCase())
   };

   if(source.attributes.length){
       evt.attributes = {};
       source.attributes.forEach((attribute)=>{
           evt.attributes[attribute.name] = attribute.value;
       });
   }
   evt.type = 'start';
   if(!evt.void) callback(evt);
   hasChildren(source, callback);
   if(evt.attributes && !evt.void) delete evt.attributes;
   evt.type = 'end';
   callback(evt);
}

export function parseHTML(source, callback){
    var endOfTagIndex,
        startTag,
        evt;
    //nodejs buffer and remove all line breaks aka dirty
    //source = source.toString().replace(/\n/g,'').replace(/\r/g,'');
    source = clean(source);
    while(source){
        var nextTagIndex = source.indexOf('<');
        if(nextTagIndex >= 0){
            //start element exists in string
            //need to convert content to evt
            if(nextTagIndex > 0) {
                callback({
                    type: 'text',
                    value: source.substring(0, nextTagIndex)
                });
            }
            //set html string to index of new element to end
            source = source.substring(nextTagIndex);
            endOfTagIndex = source.indexOf('>') + 1;
            startTag = source.substring(0, endOfTagIndex);
            evt = parseTag(startTag);
            //if not xhtml void tag check tagname for html5 valid void tags
            evt.void = (source[startTag.length - 2] === '/') || isVoid(evt.name);
            if(startTag[1] === '!'){
                //comment, ignore?
                endOfTagIndex = source.indexOf('-->') + 1;
            }else if(startTag[1] === '/' || evt.void){
                //void tag or end tag. start is never called for void tags
                evt.type = 'end';
                callback(evt);
            }else{
                //start tag
                evt.type = 'start';
                callback(evt);
            }
            // substring to end of tag
            source = source.substring(endOfTagIndex);
        }else{
            callback({
                type: 'text',
                value: source
            });
            source = null;
        }
    }
}

export function parseJSONML(source, callback){
    var index = 1,
        evt;
    if((is(source[0], 'array') || is(source[0], 'object')) && typeof source[0].length !== 'undefined'){
        parseJSONML(source[0], callback);
    }else{
        evt = {
            name: source[0],
            void: isVoid(source[0]),
            type: 'start'
        };
        if(source.length > 1 && source[1].toString() === '[object Object]'){
            index++;
            //copy primitave values to new object
            evt.attributes = extend({}, source[1]);
        }
        if(!evt.void) callback(evt);
    }

    while(index < source.length){
        if(is(source[index], 'string') || source[index].value ){
            callback({
                type: 'text',
                value: source.value || source[index]
            });
        }else{
            parseJSONML(source[index], callback);
        }
        index++;
    }
    if(typeof evt === 'undefined') return;
    if(evt.attributes && !evt.void) delete evt.attributes;
    evt.type = 'end';
    callback(evt);
}
