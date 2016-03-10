(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.windsock = factory());
}(this, function () { 'use strict';

    var babelHelpers = {};

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    babelHelpers;

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function is(target, type) {
        switch (type) {
            case 'empty':
                return Object.keys(target).length === 0;
            case 'undefined':
                return typeof target === 'undefined';
            case 'null':
                return target === null;
            default:
                return Object.prototype.toString.call(target) === '[object ' + capitalize(type) + ']';
        }
    }

    var ARRAY_MUTATOR_METHODS = ['fill', 'pop', 'push', 'shift', 'splice', 'unshift'];

    var Observer = function () {
        function Observer(callback) {
            babelHelpers.classCallCheck(this, Observer);

            if (is(callback, 'undefined')) {
                throw new Error('Failed to instantiate missing callback');
            }
            if (!is(callback, 'function')) {
                throw new Error('Invalid callback specified');
            }
            this.callback = callback;
            this._target = undefined;
            this._config = undefined;
        }

        babelHelpers.createClass(Observer, [{
            key: 'observe',
            value: function observe(target) {
                var config = arguments.length <= 1 || arguments[1] === undefined ? { recursive: false } : arguments[1];

                var observerList;
                if (!isObservable(target)) {
                    throw new Error('Failed to observe not a valid target');
                }
                if (is(config.recursive, 'undefined')) {
                    throw new Error('Invalid config specified');
                }
                observerList = new ObserverList();
                observerList.add(this);
                this._target = target;
                this._config = config;
                observable(target, observerList);
            }
        }, {
            key: 'disconnect',
            value: function disconnect() {
                if (this._target) {
                    if (this._config.recursive) {
                        disconnectRecursiveObserver(this._target, this);
                    }
                    this._target._observers.remove(this);
                }
                this._target = undefined;
                this._config = undefined;
            }
        }]);
        return Observer;
    }();

    var MutationRecord = function MutationRecord(config) {
        babelHelpers.classCallCheck(this, MutationRecord);

        this.type = config.type; //prop or array indicies
        this.target = config.target; //parent object||array
        this.method = config.method; //add,delete,update||push,pop,splice,etc.
        this.args = config.args;
        this.newValue = config.newValue; //newly transformed value
        this.oldValue = config.oldValue; //the old value(s)
    };

    var ObserverList = function () {
        function ObserverList() {
            var observers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
            babelHelpers.classCallCheck(this, ObserverList);

            this.observers = observers;
        }

        babelHelpers.createClass(ObserverList, [{
            key: 'dispatch',
            value: function dispatch(record) {
                if (!record instanceof MutationRecord) {
                    throw new Error('Invalid record specified');
                }
                this.observers.forEach(function (observer) {
                    observer.callback(record);
                });
            }
        }, {
            key: 'exists',
            value: function exists(observer) {
                return this.observers.indexOf(observer) !== -1;
            }
        }, {
            key: 'add',
            value: function add(observer) {
                return this.observers.push(observer);
            }
        }, {
            key: 'remove',
            value: function remove(observer) {
                var index = this.observers.indexOf(observer);
                if (index !== -1) {
                    this.observers.splice(index, 1);
                }
                return index;
            }
        }, {
            key: 'recursive',
            value: function recursive() {
                return this.observers.filter(function (observer) {
                    return observer._config.recursive;
                });
            }
        }, {
            key: 'recursiveExists',
            value: function recursiveExists() {
                for (var i = 0, l = this.observers.length; i < l; i++) {
                    if (this.observers[i]._config.recursive) {
                        return true;
                    }
                }
                return false;
            }
        }], [{
            key: 'recursive',
            value: function recursive(list) {
                //factory method for creating a new observer list
                //from an existing observer list where the observers are recursive
                //because this isn't exposed we don't really have to throw here
                if (!list instanceof ObserverList) {
                    throw new Error('Invalid list specified');
                }
                return new ObserverList(list.recursive());
            }
        }]);
        return ObserverList;
    }();

    function observable(target, observerList) {
        var recursive = ObserverList.recursive(observerList),
            properties = configurableProperties(target),
            descriptor;
        if (target._observers) {
            //populate current observerlist with new observers
            //from observerlist
            observerList.observers.forEach(function (observer) {
                if (!target._observers.exists(observer)) {
                    target._observers.add(observer);
                }
            });
        } else {
            descriptor = {
                _observers: {
                    value: observerList,
                    configurable: false
                }
            };
            properties.forEach(function (prop) {
                defineAccessors(prop, target[prop], descriptor);
            });
            if (is(target, 'array')) {
                defineObservableArrayMutations(target, descriptor);
            } else {
                defineObservableObjectMutations(target, descriptor);
            }
            Object.defineProperties(target, descriptor);
        }
        if (recursive.observers.length) {
            for (var i = 0, l = properties.length; i < l; i++) {
                if (isObservable(target[properties[i]])) {
                    observable(target[properties[i]], recursive);
                }
            }
        }
    }

    function defineObservableObjectMutations(target) {
        var descriptor = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        descriptor.add = {
            value: function addOperationClosure(prop, value) {
                addObjectProperty(this, prop, value);
            }
        };
        descriptor.delete = {
            value: function deleteOperationClosure(prop) {
                deleteObjectProperty(this, prop);
            }
        };
    }

    function defineObservableArrayMutations(target) {
        var descriptor = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var _loop = function _loop(i, l) {
            descriptor[ARRAY_MUTATOR_METHODS[i]] = {
                value: function arrayOperationClosure() {
                    mutateArray({
                        args: Array.prototype.slice.call(arguments),
                        method: ARRAY_MUTATOR_METHODS[i],
                        target: this
                    });
                }
            };
        };

        for (var i = 0, l = ARRAY_MUTATOR_METHODS.length; i < l; i++) {
            _loop(i, l);
        }
    }

    function isObservable(target) {
        return is(target, 'array') || is(target, 'object');
    }

    function configurableProperties(target) {
        //getOwnPropertyNames enumerable or not excluding prototype
        return Object.getOwnPropertyNames(target).filter(function (name) {
            return Object.getOwnPropertyDescriptor(target, name).configurable;
        });
    }

    function defineAccessors(prop, value) {
        var descriptor = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        descriptor[prop] = {
            get: function get() {
                return value;
            },
            set: function set(newValue) {
                var record = new MutationRecord({
                    type: prop,
                    target: this,
                    method: 'set',
                    oldValue: value,
                    newValue: newValue,
                    args: []
                });
                if (this._observers.recursiveExists() && isObservable(newValue)) {
                    observable(newValue, ObserverList.recursive(this._observers));
                }
                disconnectRecursiveObservers(this, value._observers);
                value = newValue;
                this._observers.dispatch(record);
            },
            enumerable: true,
            configurable: true
        };
        return descriptor;
    }

    function addObjectProperty(target, prop, newValue) {
        if (!is(target[prop], 'undefined')) {
            throw new Error('Failed to add ' + prop + ' already defined');
        }
        var record = new MutationRecord({
            type: prop,
            target: target,
            method: 'add',
            oldValue: target[prop],
            newValue: newValue,
            args: Array.prototype.slice.call(arguments, 1)
        });
        if (target._observers.recursiveExists() && isObservable(newValue)) {
            observable(newValue, ObserverList.recursive(target._observers));
        }
        Object.defineProperties(target, defineAccessors(prop, newValue));
        target._observers.dispatch(record);
    }

    function deleteObjectProperty(target, prop) {
        if (is(target[prop], 'undefined')) {
            throw new Error('Failed to delete ' + prop + ' does not exist');
        }
        var record = new MutationRecord({
            type: prop,
            target: target,
            method: 'delete',
            oldValue: target[prop],
            newValue: undefined,
            args: Array.prototype.slice.call(arguments, 1)
        });
        disconnectRecursiveObservers(target, target[prop]._observers);
        delete target[prop];
        target._observers.dispatch(record);
    }

    function mutateArray(options) {
        var target = options.target,
            args = options.args,
            method = options.method,
            record = new MutationRecord({
            type: undefined,
            target: target,
            method: method,
            oldValue: undefined,
            newValue: undefined,
            args: args
        });
        switch (method) {
            case 'fill':
                record.type = args.splice(1);
                record.oldValue = target.slice(args[1], args[2]);
                break;
            case 'pop':
                record.type = target.length - 1;
                record.oldValue = target.slice(target.length - 1);
                break;
            case 'push':
                record.type = target.length;
                record.newValue = args;
                break;
            case 'shift':
                record.type = 0;
                record.oldValue = target.slice(0, 1);
                break;
            case 'unshift':
                record.type = 0;
                record.newValue = args;
                break;
            case 'splice':
                record.type = args[0];
                if (args[1]) {
                    record.oldValue = target.slice(args[0], args[0] + args[1]);
                }
                break;
        }
        if (target._observers.recursiveExists()) {
            record.newValue.forEach(function (val) {
                if (isObservable(val)) {
                    observable(val, ObserverList.recursive(target._observers));
                }
            });
        }
        if (record.oldValue) {
            record.oldValue.forEach(function (val) {
                disconnectRecursiveObservers(target, val._observers);
            });
        }
        Array.prototype[method].apply(target, options.args);
        target._observers.dispatch(record);
    }

    function disconnectRecursiveObserver(target, observer) {
        configurableProperties(target).forEach(function (prop) {
            disconnectRecursiveObserver(target[prop], observer);
            if (target[prop]._observers) {
                target[prop]._observers.remove(observer);
            }
        });
    }

    function disconnectRecursiveObservers(target, observerList) {
        if (observerList) {
            target._observers.recursive().forEach(function (observer) {
                observerList.remove(observer);
            });
        }
    }

    var index = {
        version: '0.1.14',
        Observer: Observer
    };

    return index;

}));