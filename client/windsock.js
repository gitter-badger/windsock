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

    var Util = {

        log: function(val){

            if(config.debug && console) console.log(val);

        },

        nextTick: function(callback){

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

                    if(fn.apply(context, [key, list[key], list, exit].concat(args)) == exit) return;

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

        set: function(target, prop, descriptor){

            return Object.defineProperty(target, prop, descriptor);

        },

        hide: function(target, props, descriptor){

            descriptor = descriptor || Object.create(null);

            Util.each(props, function(prop, val){

                Util.set(target, prop, Util.extend({

                    value: val,
                    enumerable: false

                }, descriptor));

            });

            return target;

        },

        merge: function(obj){

            Util.each(Array.prototype.slice.call(arguments, 1), function(aux){

                for(var key in aux){

                    if(obj.hasOwnProperty(key)) obj[key] = aux[key];

                }

            });

            return obj;

        },

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
        each = util.each,
        merge = util.merge,
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

    //similar to a stream
    //returns a function that can be invoked with methods add and remove
    //calling returns a new promise only if async

    function Signals(options){

        var signals = this;

        signals._callbacks = [];

        signals._index = 0;

        signals._config = merge({

            async: true,
            flowing: false

        }, options);

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

                    return nextSignal;

                    //to support a returned promise
                    //signals._callbacks[signals._index]._signal.apply(signals._callbacks[signals._index], args).then(function(er){ if(!er) done();});

                };

            //promise is always first
            //args.unshift(promise);

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

    //removes one signal at a time just to keep it simple for now
    Signals.prototype.remove = function(signal){

        if(signal){

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

    module.exports = Parser;

    //doesn't support xml namespaces, any type of fuzzy/predictive syntax,
    //error handling, doctypes, optional closures or anything a real parser would
    //defaults to syncronous parsing
    function Parser(){

        var parser = this;

        //parseHTML signals
        each(['characters', 'start', 'end', 'done'], function(name){

            parser.parseHTML[name] = new Signals({async:true, flowing:true});

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

    Parser.prototype.parse = function(obj){

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

    //if async returns an empty done promise
    Parser.prototype.parseHTML = function(markup){

        if(!markup) return;

        //nodejs buffer and remove all line breaks = dirty
        markup = markup.toString().replace(/\n/g,'').replace(/\r/g,'');

        while(markup){

            var nextTagIndex = markup.indexOf('<');

            if(nextTagIndex >= 0 ){

                //start element exists in string
                this.parseHTML.characters(markup.substring(0, nextTagIndex));

                //set html string to index of new element to end
                markup = markup.substring(nextTagIndex);

                //grab the start tag
                var endOfTagIndex = markup.indexOf('>') + 1,
                    startTag = markup.substring(0, endOfTagIndex),
                    voidTag = (markup[startTag.length - 2] === '/');

                if(startTag[1] === '!'){

                    //comment, ignore?
                    endOfTagIndex = markup.indexOf('-->') + 1;

                }else if(startTag[1] === '/' || voidTag){

                    //void or end tag
                    this.parseHTML.end(startTag, voidTag);

                }else{

                    //start tag
                    this.parseHTML.start(startTag);

                }

                // substring to end of tag
                markup = markup.substring(endOfTagIndex);

            }else{

                this.parseHTML.characters(markup);

                //reset
                markup = null;

            }

        }

        //parse.done_flush would be the last
        return this.parseHTML.done();

    };

})();

(function(){

    'use strict';

    var util = require('./util'),
        Signals = require('./signals'),
        is = util.is,
        set = util.set,
        traverse = util.traverse,
        each = util.each;

    //observable model

    function Data(obj){

        if(obj._signals) return obj;

        var ops = {
            async: false,
            flowing: true
        };

        var accessor = {
            set: new Signals.Signal(),
            get: new Signals.Signal()
        };

        set(obj, 'update', {value: new Signals(ops), enumerable: false});

        accessor.set._signal = function(val, prop, target, oldVal){

            console.log('default set signal called');

            if(!this.value) this.value = oldVal;

            if(is(val, 'array') || is(val, 'Object')){

                this.value = Data(val);
                return;

            }

            this.value = val;

        };

        accessor.get._signal = function(val, prop, target){

            console.log('default get signal called');

        };

        accessor.set._flush = function(){

            obj.update.apply(this, arguments);

        };

        traverse(obj, function(){

            //closure to hold ref to value
            var target = arguments[2],
                prop = arguments[0],
                value = arguments[1];

            if(is(target, 'array')){

                prop = arguments[1];
                value = arguments[0];

            }

            if(!target._signals) set(target, '_signals', {

                value: Object.create(null),
                enumerable: false,
                writable:true

            });

            //hide(target, {_signals:{}}, {writable:true});

            //create observer signal object
            target._signals[prop] = Object.create(null);

            var g = new Signals(ops);
                g.add(accessor.get);
            set(target._signals[prop], 'get', {value: g, enumerable: false});

            var s = new Signals(ops);
                s.add(accessor.set);
            set(target._signals[prop], 'set', {value: s, enumerable: false});

            set(target, prop, {

                set:function(v){

                    //call the signals with params and set value to returned signal value
                    value = target._signals[prop].set(v, prop, target, value).value;

                },

                get: function(){

                    target._signals[prop].get(value, prop, target);
                    return value;

                }

            });

        });

        return obj;

    }

    module.exports = Data;

})();

(function(){

    'use strict';



})();

(function(){

    'use strict';

    var util = require('./util'),
        Data = require('./data'),
        Markup = require('./markup'),
        inherit = util.inherit,
        extend = util.extend;

    module.exports = this.windsock = Windsock;

    function Windsock(ops){

        ops = ops || Object.create(null);

        var windsock = this;

        var data = ops.data || windsock.data || Object.create(null);

        //make data observable
        windsock.data = Data(data);

        var markup = ops.markup || '';

        //windsock.parser = new Parser();

        //parse markup
        //windsock.parser.parse(markup).then(windsock.bind);

        //and make it observable


    }

    //default bindings
    Windsock.prototype.bindings = [{

        data: '',
        markup: '*'

    }];

    Windsock.prototype.selectors = {

        data: function(queryObject, dataObject){

            if(util.is(queryObject, 'string')){

                //this is called to match
                if(dataObject[queryObject]) return dataObject[queryObject];//or true?

            }

        },

        markup: function(queryObject, markupObject){



        }

    };

    Windsock.extend = function(obj){

        var windsock = function(){

            Windsock.call(this);

        };

        inherit(windsock, Windsock);

        extend(windsock.prototype, obj);

        return windsock;

    };

}).call(this);
