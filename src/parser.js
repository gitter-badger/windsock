(function(){

    'use strict';

    var Signals = require('./signals'),
        util = require('./util'),
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

    module.exports = Parser;

    //doesn't support xml namespaces, any type of fuzzy/predictive syntax,
    //error handling, doctypes, optional closures or anything a real parser would
    //defaults to syncronous parsing
    function Parser(options){

        var parser = this;

        parser.options = util.merge({

            async:false,
            flowing:true

        }, options);

        //parseHTML signals
        each(['start', 'content', 'end', 'done'], function(name){

            parser[name] = new Signals(parser.options);

        });

    }

    function loop(){

        //factory method for creating signals loop
        //create a destroy signal loop everytime?
        //pass signals callbacks as options
        //return loop signal to call, don't actually call it
        //can add callbacks after create
        //looping jsoml is different then loopiing dom elements is dif than looping html string
        //parse HTML with read only signals - linear traversal
        //parse jsonml with read only signals - traverses in
        //parse dom elements with read only signals - traverses in

    }

    //html string loop

    //jsonml loop

    //dom loop
    Parser.prototype.parseDOM = function(node){

        if(node.nodeName === 'SCRIPT') return;

        var attr = {};

        each(node.attributes, function(attribute, index){

            attr[attribute.nodeName] = attribute.nodeValue;

        });

        //r.push(attr);
        //this.parse.start(node.nodeName, attr, node);

        if(node.hasChildNodes()){

            var childNode = node.childNodes;

            for (var i = 0; i < childNode.length; i++) {

                if(childNode[i].nodeType == 1){

                    //r.push(JsonML.convert (childNode[i]));
                    //this.parse.characters(this.dom(childNode[i]));

                }else if(childNode[i].nodeType == 3) {

                    //this.parse.characters(childNode[i].nodeValue);

                }

            }

        }

        //return this.parse.end(node.nodeName);
        return this.parseHTML.done();

    };

    //factory method
    Parser.build = function(obj, options){

        var parser = function(){};
        //inherit the different constructor
        inherit(parser, Parser);

        return new Parser(options);

    };

    Parser.prototype.parse = function(obj){

        if(!obj) return;

        if(is(obj, 'string')){

            //treat as html
            return this.parseHTML(obj);

        }else if(obj.nodeName){

            //html element
            //
            return this.parseDOM(obj);

        }else{

            //assume a jsonml object?
            return this.parseJSONML(obj);

        }

    };

    Parser.prototype.parseJSONML = function(obj){

        this.content(obj);

    };

    //if async returns an empty done promise
    Parser.prototype.parseHTML = function(markup){

        if(!markup) return;

        //nodejs buffer and remove all line breaks = dirty
        markup = markup.toString().replace(/\n/g,'').replace(/\r/g,'');

        while(markup){

            var nextTagIndex = markup.indexOf('<');

            if(nextTagIndex >= 0 ){

                //start element exists in string
                this.content(markup.substring(0, nextTagIndex));

                //set html string to index of new element to end
                markup = markup.substring(nextTagIndex);

                //grab the start tag
                var endOfTagIndex = markup.indexOf('>') + 1,
                    startTag = markup.substring(0, endOfTagIndex),
                    parsedTag = parseTag(startTag),
                    //if not xhtml void tag check tagname for html5 valid void tags
                    voidTag = (markup[startTag.length - 2] === '/') || isVoid(parsedTag.nodeName);

                if(startTag[1] === '!'){

                    //comment, ignore?
                    endOfTagIndex = markup.indexOf('-->') + 1;

                }else if(startTag[1] === '/' || voidTag){

                    //void tag or end tag. start is never called for void tags
                    this.end(parsedTag, voidTag);

                }else{

                    //start tag
                    this.start(parsedTag);

                }

                // substring to end of tag
                markup = markup.substring(endOfTagIndex);

            }else{

                this.content(markup);

                //reset
                markup = null;

            }

        }

        //parse.done_flush would be the last
        return this.done();

    };

    function parseTag (tag){

        var node = {
            nodeName: '',
            attributes: {}
        },
        reg = /(([\w\-]+([\s]|[\/>]))|([\w\-]+)="([^"]+)")/g;

        var m = tag.match(reg);

        for(var i = 0, l= m.length;i<l;i++){

            var keyVal = m[i].split('=');

            if(i === 0) {

                node.nodeName = keyVal[0].replace('/','').replace('>','').trim();

            }else if(keyVal.length > 1){

                node.attributes[keyVal[0]] = keyVal[1].replace('"','').replace('"','');

            }else{

                node.attributes[keyVal[0]] = null;

            }

        }

        return node;

    };

    function isVoid(tag){

        for(var i = 0, l = voidTags.length; i < l; i++){

            if(voidTags[i] === tag) return true;

        }

        return false;

    };

})();
