(function(){
    //custom client polyfill for commonjs
    //not using strict in order to declare module and require on window
    //the only prerequisit for modules as objects is they need to have an inenumerable _ns
    //prop that's the same as their filename and module.exports is set afterward

    if(typeof module == 'undefined') {

        //declare on global once for client
        _exports = Object.create(null);

        module = {

            set exports(val){

                if(Object.prototype.toString.call(val) == '[object Function]'){

                    var ns = val._ns || val.toString().match(/function ([^\(]*)/)[1].toLowerCase();
                    //dirty, ie doesn't support fn.name
                    _exports[ns] = val;

                }else{

                    if(!val._ns) throw new Error('Export namespace missing');

                    _exports[val._ns] = _exports[val._ns] || {};

                    for(var key in val){

                        _exports[val._ns][key] = val[key];

                    }

                }

            },

            get exports(){

                return _exports;

            }

        };

    }

    if(typeof require == 'undefined') require = function(path){

        //possible sub folder namespacing path.match(/[^\/]*/g) .shift() for .. or . and .join('_')
        return module.exports[path.match(/[^\/]+$/).join()];

    };

    //global default configuration properties
    var config = {

        client: (typeof document !== 'undefined'),
        debug: true

    };

    Object.defineProperty(config, '_ns', {

            value: 'config',
            enumerable: false

    });

    module.exports = config;

})();

(function(){

    'use strict';

    var config = require('./config');

    //grab circular ref to window
    var win = this.window,
        nextPaint = this.requestAnimationFrame || this.setTimeout,
        tick = (typeof process !== 'undefined' && process.nextTick) ? process.nextTick : nextPaint;
        //defer to nextpaint on the client

    var Util = {

        log: function(val){

            if(config.debug && console) console.log(val);

        },

        nextTick: function(callback){
            //defer callback to nextTick in node otherwise requestAnimationFrame in the client
            tick(callback, 0);

        },

        each: function(list, fn, context){

            context = context || this;

            var args = Array.prototype.slice.call(arguments, 3),
                exit = Object.create(null);

            if(list.length){

                for(var i = 0, l = list.length; i < l; i++){

                    if(fn.apply(context, [list[i], i, list, exit].concat(args)) == exit) return;

                }

            }else{

                for(var key in list){

                    if(fn.apply(context, [list[key], key, list, exit].concat(args)) == exit) return;

                }

            }

        },

        traverse: function(list, fn, context){

            context = context || this;

            var args = Array.prototype.slice.call(arguments, 3);

            Util.each(list, function(){

                //call function on result first
                var exit = fn.apply(this, Array.prototype.slice.call(arguments));

                var i = 0;

                while(i < 2){

                    //then check if array/object for further traversal
                    if(arguments[i] instanceof Object && !arguments[i].call){

                        Util.traverse(arguments[i], fn, context, args);

                    }

                    i++;

                }

                return exit;

            }, context, args);

        },

        set: function(obj, props){

            var descriptor = Array.prototype.slice.call(arguments, 2);

            if(descriptor.length) return Object.defineProperty(obj, props, descriptor[0]);

            return Object.defineProperties(obj, props);

        },

        merge: function(obj){

            Util.each(Array.prototype.slice.call(arguments, 1), function(aux){

                for(var key in aux){

                    if(obj.hasOwnProperty(key)) obj[key] = aux[key];

                }

            });

            return obj;

        },

        //props is a object.defineProp descriptor
        inherit: function(construct, superConstruct, props){

            //Sets the prototype of the construct to a new object created from super.
            //Uses ECMAScript 5 Object.create
            if(construct.prototype && superConstruct.prototype){

                //Use carefully: v8 creates subclasses everytime the prototype is modified.
                construct.prototype = Object.create(superConstruct.prototype, props);
                construct.prototype.constructor = construct;

            }

            return construct;

        },

        extend: function(obj){

            Util.each(Array.prototype.slice.call(arguments, 1), function(aug){

                for(var key in aug){

                    obj[key] = aug[key];

                }

            });

            return obj;

        },

        //Matches a query object key/values and returns a shallow list of matching results.
        //uses in for properties which includes inherited but not non enumerable props
        match: function(list, query){

            var matched = true;

            Util.each(query, function(val, key){

                if(list[key] !== val) matched = false;

            });

            return matched;

        },

        bind: function(fn, context){

            return function(){

                return fn.apply(context, Array.prototype.slice.call(arguments));

            };

        },

        is: function(obj, type){

            return Object.prototype.toString.call(obj) === '[object ' + Util.upperCase(type) + ']';

        },

        upperCase: function(str){

            return str.replace(/[a-z]/, function(match){return match.toUpperCase()});
        },

        isClient: function(){

            return config.client;

        },

        isEmpty: function(obj){

            for(var key in obj){

                if(Object.prototype.hasOwnProperty.call(obj, key)) return false;

            }

            return true;

        }

    };

    Object.defineProperty(Util, '_ns', {

            value: 'util',
            enumerable: false

    });

    module.exports = Util;

}).call(this);

(function(){

    'use strict';

    var util = require('./util'),
        is = util.is,
        extend = util.extend,
        merge = util.merge,
        each = util.each,
        inherit = util.inherit,
        nextTick = util.nextTick;

    module.exports = Signals;

    Signals.Promise = Promise;
    Signals.Signal = Signal;

    function Promise(){

        this._callbacks = [];

    }

    Promise.prototype.then = function(fn){

        if(is(fn, 'function')) {

            this._callbacks.push(fn);

        }

        return this;

    };

    //similar to a transform stream
    function Signal(){}

    Signal.prototype._signal = function(){};

    Signal.prototype._flush = function(){};

    Signal.extend = function(obj, fn){

        var signal = function(){

            Signal.call(this);
            if(fn) fn.apply(this, arguments);

        };

        inherit(signal, Signal);

        extend(signal.prototype, obj);

        return signal;

    };

    //similar to a stream
    //returns a function that can be invoked with methods add and remove
    //calling returns a new promise only if async

    function Signals(options){

        var signals = this;

        signals._callbacks = Array.prototype.slice.call(arguments, 1);

        if(is(signals._callbacks[0], 'array')) signals._callback = signals._callback[0];

        signals._index = 0;

        signals._config = merge({

            async: true,
            flowing: false

        }, options);

        //return an extended closure
        return extend(function(){

            if(!signals._callbacks.length) return {then:function(fn){nextTick(fn);}};

            var promise = new Promise(signals._config.async),

                args = Array.prototype.slice.call(arguments),

                done = function(){

                    //first increment
                    signals._index ++;

                    //need to call the next callback or promise.then
                    if(signals._index === signals._callbacks.length) {

                        each(promise._callbacks, function(fn){ fn.call(signals); }, signals);

                        each(signals._callbacks, function(fn){ fn._flush.apply(fn, args); });

                        //reset index
                        signals._index = 0;

                    }else{

                        if(signals._config.async){

                            nextTick(tick);

                        }else{

                            tick();

                        }

                    }

                },

                tick = function(){

                    var nextSignal = signals._callbacks[signals._index];

                    nextSignal._signal.apply(nextSignal, args);

                    if(signals._config.flowing) done();

                    //return value only matters for sync callbacks
                    return signals;

                    //to support a returned promise
                    //signals._callbacks[signals._index]._signal.apply(signals._callbacks[signals._index], args).then(function(er){ if(!er) done();});

                };

            if(!signals._config.flowing) args.push(done);

            if(signals._config.async){

                nextTick(tick);
                return promise;

            }else{

                return tick();

            }

        }, signals);

    }

    //can only add instances of signal
    Signals.prototype.add = function(signal){

        if(!(signal instanceof Signal) && !(signal._signal)) throw new Error('add() requires an instance of Signal');

        this._callbacks.push(signal);

        return this;

    }

    //removes one or all signals just to keep it simple for now
    Signals.prototype.remove = function(signal){

        if(signal){

            if(is(signal, 'number')){

                this._callbacks.splice(signal, 1);

                return this;

            }

            if(!(signal instanceof Signal) && !(signal._signal)) throw new Error('remove() requires an instance of Signal');

            each(this._callbacks, function(f, i, list, exit){

                if(f === signal){

                    list.splice(i, 1);

                    return exit;

                }

            });

        }else{

            this._callbacks = [];

        }

        return this;

    };

})();

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

(function(){

    'use strict';

    var util = require('./util'),
        Signals = require('./signals'),
        is = util.is,
        set = util.set,
        extend = util.extend,
        traverse = util.traverse,
        each = util.each;

    function Observer(fn){

        var observer = new Signals.Signal.extend({

            context: null,

            _signal: function(){

                fn.apply(this.context, arguments);

            }

        });

        return new observer();

    }

    //subject is a simple signal wrapper
    function Subject(obj){

        extend(this, obj);

        this.observers = new Signals({async:false, flowing:true});

    }

    Subject.prototype.add = function(observer){

        observer.context = this;

        this.observers.add(observer);

    };

    Subject.prototype.list = function(){

        return this.observers._callbacks;

    };

    Subject.prototype.remove = function(observer){

        this.observers.remove(observer);

    };

    Subject.prototype.emit = function(){

        //applying a context to a signal gets overridden
        this.observers.apply(undefined, arguments);

    }

    Data.Observer = Observer;
    Data.Subject = Subject;

    //blegh this isn't working
    Data.mutate = function(obj, key, fn){

        if(!obj._observable) throw new Error('Object is non mutatable. Missing observers.');

        //return by key/index if removed on object/array so we can clean up
        //instead of manually cleaning this up we could do a traversal and compare...
        var removeKey = fn(obj[key]);
        obj[key] = {asd:'asd'};
        console.log(obj[key].prop);

        if(removeKey) {
            //remove all observers
            obj[key]._observable[removeKey].remove();
            //set subject to undefined
            obj[key]._observable[removeKey] = undefined;
        }

        Data(obj[key]);

        obj._observable[key].emit('mutate', key, obj);
        //obj._observable._parent.emit('mutate', key);

    };

    Data.observe = function(obj, key, fn){

        if(!obj._observable || !obj._observable[key]) throw new Error('Observable key "' + key + '" does not exist');

        obj._observable[key].add(new Observer(fn));
        //obj._observable._parent.add(new Observer(fn));

    };

    Data.proxy = function(proxy, obj, alias){

        //create an observable object
        Data(obj);

        //create proxy accessors for literals only
        each(obj, function(value, key){

            var aliasKey = key;

            //optionally alias proxied key with another
            if(alias && alias[key]) aliasKey = alias[key];

            set(proxy, aliasKey, {

                set: function(v){

                    obj[key] = v;

                },

                get: function(){

                    return obj[key];

                }

            });

        });

    };

    //observable model
    //todo offer optional bubbling to parent
    function Data(obj){

        traverse(obj, function(){

            //var args = util.orderEach.apply(undefined, arguments);

            var parent = arguments[2],
                prop = arguments[1],
                value = arguments[0],
                observers = [];

            // if(is(parent, 'array')){

            //     prop = arguments[1];
            //     value = arguments[0];

            // }

            //check if parent already has an _observable prop
            if(!parent._observable){
                set(parent, {
                    _observable: {
                        writable: true,
                        enumerable: false,
                        value: Object.create(null)
                    }
                });
            }

            //already have existing observers
            if(parent._observable[prop]) {

                observers = observers.concat(parent._observable[prop].list());
                //console.log(observers.length);
            }

            //for each prop on parent set value
            set(parent._observable, prop, {
                writable: true,
                enumerable: true,
                value: new Subject({
                    value: value,
                    parent: parent
                })
            });


            //!reserved word _parent, DO NOT USE OMG
            // if(!parent._observable._parent){
            //     set(parent._observable, '_parent', {
            //         writable: true,
            //         enumerable: false,
            //         value: new Subject({
            //             self: parent
            //         })
            //     });
            // }

            //var observer = new Observer(function(method, property, parentObj){});

            //if(!observers.length) observers.push(observer);
            //parent._observable[prop].add(observer);

            each(observers, function(obv){
                parent._observable[prop].add(obv);
            });

            //because target exists we reset the propertiy value to a descriptor with accessors
            set(parent, prop, {

                set:function(v){

                    if(is(v, 'array') || is(v, 'object')) Data(v);

                    parent._observable[prop].value = v;

                    //emit for listeners on prop
                    parent._observable[prop].emit('set', prop, parent);
                    //parent._observable._parent.emit('set', prop, v);

                },

                get: function(){

                    parent._observable[prop].emit('get', prop, parent);

                    return parent._observable[prop].value;

                }

            });

        });

        return obj;

    }

    module.exports = Data;

})();

(function(){

    'use strict';

    var Parser = require('./parser'),
        Signals = require('./signals'),
        util = require('./util'),
        is = util.is,
        each = util.each,
        merge = util.merge,
        extend = util.extend,
        traverse = util.traverse;

    //jsonml manip and traversal
    function Markup(obj, options){

        merge(this.options, options);

        this._selection = this._jsonml = [];

        var parser = new Parser(this.options.parser);

        var parseSignal = Signals.Signal.extend({

            markup: this

        }, function(fn){ this._signal = fn; });

        var tagsig = new parseSignal(function(tag, voidTag){

            //called for both start tag and end tag events
            if(voidTag || typeof voidTag === 'undefined'){

                if(voidTag){

                    this.markup.append(tag);

                }else{

                    this.markup.insert(tag);

                }

            }else{

                // voidtag is defined and false, close and set selection to parent
                this.markup.parent();

            }

        });

        var endtag

        var contentsig = new parseSignal(function(content){

            if(content.length){

                this.markup.append(content);

            }

        });

        parser.start.add(tagsig);
        parser.content.add(contentsig);
        parser.end.add(tagsig);

        parser.parse(obj);

    }

    Markup.prototype.options = {

        parser : {

            async: false,
            flowing: true

        }

    };

    //jsonml
    Markup.prototype.each = function(fn){

        var args = Array.prototype.slice(arguments, 1);

        each.apply(this, [this._selection, fn].concat(args));

        return this;

    };

    Markup.prototype.traverse = function(fn, selection){

        selection = selection || this._selection;

        traverse.call(this, selection, fn);

        return this;

    };

    Markup.prototype.append = function(obj){

        this._selection.push(this.convert(obj));

    };

    //wrap for splice, optionally sets selection
    Markup.prototype.insert = function(obj, i){

        var jsonml = is(obj, 'object') ? this.convert(obj) : obj,
            index = 0;

        //i should be greater than 1 if selection has attributes
        if(i && i > 0){

            Array.prototype.splice.call(this._selection, i, 0, jsonml);
            index = this._selection.length - 1;

        }else{

            index = Array.prototype.push.call(this._selection, jsonml) - 1;

        }

        if(is(jsonml, 'array')) {

            //if an array and not text node set active selection
            this._selection = this._selection[index];

        }

        return this;

    };

    //for now just simple convert object literal tojsonml
    Markup.prototype.convert = function(obj){

        if(is(obj, 'string') || is(obj, 'array')) return obj;

        var jsonml = [];

        jsonml[0] = obj.nodeName;

        if(obj.attributes && !util.isEmpty(obj.attributes)) jsonml[1] = obj.attributes;

        // each(obj, function(val, key){

        //     util.set(jsonml, key, {
        //         value: val,
        //         writable: true,
        //         enumerable: false
        //     });

        // });

        return jsonml;

    };

    //markup.find('tag name')
    //markup.find('attr name', 'attr value')
    //markup.find({nodeName: 'h1', class: 'someClass'})
    //all of these methods return a new instance of markup with exception of
    //markup.find() sets current selection to entire object
    //markup.find(int) sets current selection to index
    Markup.prototype.find = function(query){

        if(is(query, 'number')) {
            this._selection = this._selection[query];
            return this;
        }

        if(!query) {
            this._selection = this._jsonml;
            return this;
        }

        var args = Array.prototype.slice.call(arguments);

        var queryObject = {
            nodeName:'',
            attributes: {}
        };

        if(args.length > 1){

            queryObject.attributes[args[0]] = queryObject.attributes[args[1]];

        }else if(is(query, 'string')){

            //traverse just tag names
            queryObject.nodeName = query;

        }else if(is(query, 'object')){

            //match all props
            extend(queryObject, query);

        }

        //['div','asd']
        //['br']
        //['asd',['div',{}, 'asd'],'asd',['br']]
        var match = new Markup();

        this.traverse(function(val, index, node, exit){

            if(index > 0 || is(node, 'object')) return; //skip anything past tagname

            console.log('matching');
            console.log(node);
            console.log(queryObject);

            if(queryObject.nodeName.length){

                if(node[0] !== queryObject.nodeName) return;

            }

            if(!util.isEmpty(queryObject.attributes)){

                if(!is(node[1], 'object')) return;

                if(util.match(node[1], queryObject)) {

                    match.append(node);//append parent which might have kids
                    console.log('match');

                }

            }else{

                match.append(node);
                console.log('match');

            }


        }, this._jsonml);

        if(match._jsonml.length) return match;

        return this;

    };

    Markup.prototype.replace = function(v){

        this._selection = v;
        return this;

    };

    //returns flat list of children
    Markup.prototype.children = function(selection, qualifier){

        selection = selection || this._selection;

        qualifier = qualifier || function(){return true;};

        var sweetChidrens = [];

        each(selection, function(child){

            if(is(child, 'array') && qualifier.call(this, child)){

                sweetChidrens.push(child);

            }

        }, this);

        return new Markup(sweetChidrens, this.options);

    };

    //sets selection to parent of selection
    Markup.prototype.parent = function(){

        this.traverse(function(node, index, parent, exit){

            if(index > 0) return; //skip anything past tagname

            var match = this.children(parent, function(child){

                if(child == this._selection) return true;
                return false;

            });

            if(match._jsonml.length){

                this._selection = parent;
                return exit;

            }

        }, this._jsonml);

        return this;

    };

    Markup.prototype.jsonml = function(){

        return this._jsonml;

    };

    module.exports = Markup;

})();

(function(){

    'use strict';

    var util = require('./util'),
        Data = require('./data'),
        Markup = require('./markup'),
        is = util.is,
        inherit = util.inherit,
        extend = util.extend,
        each = util.each,
        traverse = util.traverse,
        merge = util.merge;

    module.exports = this.windsock = Windsock;
    
 /**
  * Windsock
  * @constructor
  * @param {object} ops - Object literal of options to be merged.
 */

    function Windsock(ops){

        var windsock = this;

        var options = windsock.options = {

            data: Object.create(null),

            markup: Object.create(null),

            bindings: Windsock.bindings,

            selectors: Windsock.selectors

        };

        Data.proxy(windsock, options);

        Data.observe(options, 'markup', function(method){

            switch(method){
                case 'set':
                    //parse new markup
                    this.value = new Markup(this.value);
                    //and rebind
                break;
            }

        });

        Data.observe(options, 'data', function(method){

            switch(method){
                case 'set':
                    //rebind
                break;
            }

        });

        if(ops) merge(windsock, ops);

        Windsock.bind(windsock.data, windsock.markup, windsock.bindings);

    }

    //instead of a keypath, pass the actual object and key
    Windsock.observe = function(obj, key, fn){

        Data.observe(obj, key, fn);

    };

    Windsock.prototype.observe = function(key, fn){

        if(this.data[key]) Data.observe(this.data, key, fn);

    };

    Windsock.prototype.find = function(query){

        return this.markup.find(query);

    };

    Windsock.extend = function(obj){

        var windsock = function(){

            Windsock.call(this);

        };

        inherit(windsock, Windsock);

        extend(windsock.prototype, obj);

        return windsock;

    };

    //default bindings,
    //values are passed to selectors to determine matches
    //if function, its passed the entire object
    //both must evaluate to true inside selector to have bind method applied
    Windsock.bindings = [{

        data: function(){return true;},
        markup: function(){return true;},
        bind: function(){

            console.log('data changed');

        },
        manip: function(){
            //optional manip function for data, would this be useful?
        }

    }];

    //how to use bindings on object, responsible for looping and returning results
    Windsock.selector = {

        //this is the queryobject
        data: function(key, val, obj){

            //console.log(this);

            if(is(this, 'string')){
                //console.log('in hur');

                //this is called to match
                if(key == this) return true;
                return false;

            }

        },

        markup: function(node, index, parent){

            if(is(this, 'string')){

                if(node == this) return true;
                return false;

            }

        }

    };

    Windsock.bind = function(data, markup, bindings){

        each(bindings, function(binding){

            //Windsock.selector.data.apply(binding.data, )

            traverse(data, function(key, value, obj){

                //if binding isnt a selector, pass it and the args to the default selector
                if(Windsock.selector.data.apply(binding.data, arguments)){

                    console.log('matched data');
                    //console.log(arguments);

                    traverse(markup, function(val, index, node){



                        if(Windsock.selector.markup.apply(binding.markup, arguments)){

                            console.log('matched markup');
                            //console.log(arguments);

                            //if array
                            //if binding.bind > default callback for observe


                            Windsock.observe(obj, key, function(method){
                                if(method == 'get') return;


                                //and then change dom somehow lolz - will happen if node has dom ref
                            });



                        }

                    });

                }

            });

        });

    };

}).call(this);
