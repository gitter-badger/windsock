(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('windsock')) :
    typeof define === 'function' && define.amd ? define(['windsock'], factory) :
    (factory(global.windsock));
}(this, function (windsock) { 'use strict';

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

    babelHelpers.inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    babelHelpers.possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    babelHelpers;

    var Item = function (_Component) {
        babelHelpers.inherits(Item, _Component);

        function Item(options, data, index) {
            babelHelpers.classCallCheck(this, Item);

            if (!options.template) {
                throw new Error('Item component requires a template');
            }

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Item).call(this, options));

            _this.data = data;
            _this.index = index;
            return _this;
        }

        babelHelpers.createClass(Item, [{
            key: 'render',
            value: function render() {
                var c = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

                var vdom = windsock.clone(this.template, true);
                vdom = this.parse && this.parse(vdom, this) || vdom;
                vdom.attributes['data-index'] = this.index;
                if (c) {
                    vdom = windsock.compile(vdom);
                    if (this.compile) {
                        vdom = this.compile && this.compile(vdom, this) || vdom;
                    }
                }
                return vdom;
            }
        }]);
        return Item;
    }(windsock.Component);

    var state = {
        todos: [],
        active: 0,
        editing: null,
        route: ''
    };

    var mutations = {
        route: function route(state, _route) {
            if (state.route !== _route) {
                state.route = _route;
            }
        },
        editing: function editing(state, todo) {
            state.editing = todo;
        },
        edit: function edit(state, todo, text) {
            todo.text = text;
        },
        add: function add(state, text) {
            state.todos.push({
                text: text,
                completed: false
            });
            state.active++;
        },
        toggle: function toggle(state, index, value) {
            if (index === true) {
                state.todos.forEach(function (todo) {
                    todo.completed = value;
                });
                state.active = value ? 0 : state.todos.length;
            } else {
                state.todos[index].completed = !state.todos[index].completed;
                state.todos[index].completed ? state.active-- : state.active++;
            }
        },
        clear: function clear(state, index) {
            var completed = void 0,
                active = void 0;
            if (index === true) {
                completed = state.todos.filter(function (todo) {
                    return todo.completed;
                });
                while (completed.length) {
                    state.todos.splice(state.todos.indexOf(completed.pop()), 1);
                }
                active = state.todos.length;
            } else {
                active = state.todos[index].completed ? state.active : state.active - 1;
                state.todos.splice(index, 1);
            }
            state.active = active;
        }
    };

    var TODOS_KEY = 'todos';

    var todos = localStorage.getItem(TODOS_KEY);
    todos = todos ? JSON.parse(todos) : [];
    state.active = todos.filter(function (todo) {
        return !todo.completed;
    }).length;
    state.todos = todos;

    var store = new windsock.Store(state, mutations, function (name, state) {
        localStorage.setItem(TODOS_KEY, JSON.stringify(state.todos));
    });

    var item = new windsock.Bind({
        bind: function bind(node, target) {
            var input = node.find({ class: 'edit' });
            input.attributes.value = target.value.text;
            node.find('label').children[0].text = target.value.text;
            node.attributes.class = target.value.completed ? 'todo completed' : 'todo';
            if (target.value.completed === false) {
                delete node.find({ class: 'toggle' }).attributes.checked;
            }
            return {
                node: node,
                prop: 'node'
            };
        },
        update: function update(node, binding, mutation) {
            var checkbox = node.find({ class: 'toggle' }),
                input = node.find({ class: 'edit' });

            if (mutation.type === 'completed') {
                node.attributes.class = mutation.newValue ? 'todo completed' : 'todo';
                if (checkbox.compiled) {
                    if (checkbox.DOMNode.checked !== mutation.newValue) {
                        checkbox.DOMNode.checked = mutation.newValue;
                    }
                    if (state.route === 'active' && mutation.newValue || state.route === 'completed' && !mutation.newValue) {
                        node.attributes.style = 'display:none;';
                    } else {
                        node.attributes.style = node.attributes.style && node.attributes.style.replace('display:none;', '');
                    }
                }
            }
            if (mutation.type === 'text') {
                node.find('label').children[0].text = mutation.newValue;
                if (node.compiled) {
                    input.DOMNode.value = mutation.newValue;
                } else {
                    input.attributes.value = mutation.newValue;
                }
            }
        },
        compile: function compile(node, binding) {
            var todo = binding.target.value,
                index = state.todos.indexOf(todo),
                input = node.find({ class: 'edit' }),
                t = null;

            node.todo = todo;

            node.find('label').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (t) {
                    clearTimeout(t);
                    store.dispatch('editing', todo);
                    t = null;
                } else {
                    t = setTimeout(function () {
                        t = null;
                    }, 450);
                }
            });
            node.find({ class: 'toggle' }).on('change', function () {
                store.dispatch('toggle', index);
            });
            node.find('button').on('click', function () {
                store.dispatch('clear', index);
            });
            input.on('focus', function (e, n) {
                n.DOMNode.value = n.DOMNode.value;
            });
            input.on('blur', function (e, n) {
                store.dispatch('editing', null);
                if (n.DOMNode.value.length) {
                    store.dispatch('edit', todo, n.DOMNode.value);
                } else {
                    store.dispatch('clear', index);
                }
            });
            input.on('keyup', function (e, n) {
                if (e.keyCode === 13) {
                    store.dispatch('editing', null);
                    if (n.DOMNode.value.length) {
                        store.dispatch('edit', todo, n.DOMNode.value);
                    }
                }
                if (e.keyCode === 27) {
                    e.preventDefault();
                    e.stopPropagation();
                    store.dispatch('editing', null);
                }
            });
        }
    });

    var DISPLAY_NONE = 'display:none;';

    var Conditional = function (_Bind) {
        babelHelpers.inherits(Conditional, _Bind);

        function Conditional(predicate) {
            var remove = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
            babelHelpers.classCallCheck(this, Conditional);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Conditional).call(this, function (node, binding) {
                var target = binding.target || binding;
                _this.predicate(node, target) ? _this.show(node) : _this.hide(node);
                return {
                    node: node,
                    prop: remove ? 'node' : 'style'
                };
            }));

            _this.predicate = predicate;
            _this.remove = remove;
            return _this;
        }

        babelHelpers.createClass(Conditional, [{
            key: 'show',
            value: function show(node) {
                if (this.remove) {
                    node.lastParent && node.lastParent.append(node);
                } else {
                    if (node.attributes.style) {
                        node.attributes.style = node.attributes.style.replace(DISPLAY_NONE, '');
                    }
                }
            }
        }, {
            key: 'hide',
            value: function hide(node) {
                var parent = void 0;
                if (this.remove) {
                    parent = node.parent;
                    node.remove();
                    node.lastParent = parent;
                } else {
                    if (node.attributes.style && node.attributes.style.indexOf(DISPLAY_NONE) !== -1) {
                        return;
                    }
                    if (typeof node.attributes.style !== 'undefined') {
                        node.attributes.style += DISPLAY_NONE;
                    } else {
                        if (node.compiled) {
                            node.attributes.add('style', DISPLAY_NONE);
                        } else {
                            node.attributes.style = DISPLAY_NONE;
                        }
                    }
                }
            }
        }]);
        return Conditional;
    }(windsock.Bind);

    var completed = new Conditional(function (node) {
        switch (state.route) {
            case '':
                return true;
                break;
            case 'active':
                return node.attributes.class.indexOf('completed') === -1;
                break;
            case 'completed':
                return node.attributes.class.indexOf('completed') !== -1;
        }
    });

    var editing = new windsock.Bind({
        bind: function bind(node) {
            return {
                node: node,
                prop: 'class'
            };
        },
        update: function update(node, binding) {
            if (binding.target.parent[binding.target.key] === node.todo) {
                node.attributes.class += ' editing';
                if (node.compiled) {
                    setTimeout(function () {
                        node.find({ class: 'edit' }).DOMNode.focus();
                    }, 10);
                }
            } else {
                node.attributes.class = node.attributes.class && node.attributes.class.replace(' editing', '');
            }
        }
    });

    var template$2 = '\n<li class="completed">    <div class="view">        <input class="toggle" type="checkbox" checked>        <label>Taste JavaScript</label>        <button class="destroy"></button>    </div>    <input class="edit" value="Create a TodoMVC template"></li>';

    var parse$2 = function parse(template, component) {
        item.render(template, component.data);
        completed.render(template, state, 'route');
        editing.render(template, state, 'editing');
    };

    var Todo = function (_Item) {
        babelHelpers.inherits(Todo, _Item);

        function Todo(_ref, data) {
            var root = _ref.root;
            babelHelpers.classCallCheck(this, Todo);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Todo).call(this, {
                selectors: {
                    name: 'todo',
                    compile: 'li'
                },
                template: template$2,
                parse: parse$2,
                root: root
            }, data));
        }

        return Todo;
    }(Item);

    //list bind must be instantiated with an extended Item

    var List = function (_Bind) {
        babelHelpers.inherits(List, _Bind);

        function List(Item) {
            babelHelpers.classCallCheck(this, List);

            var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(List).call(this, {
                bind: function bind(parent, target) {
                    var item = void 0;
                    target.value.forEach(function (data, i) {
                        item = new _this.Item({
                            root: false
                        }, data, i);
                        parent.append(item.render());
                    });
                    return {
                        node: parent,
                        prop: 'children'
                    };
                },
                update: function update(parent, binding, mutation) {
                    var item = void 0;
                    switch (mutation.method) {
                        case 'push':
                            item = new _this.Item({
                                root: false
                            }, mutation.newValue[0], parent.children.length);
                            parent.append(item.render(parent.compiled));
                            break;
                        case 'splice':
                            parent.children.splice(mutation.args[0], mutation.args[1]);
                            break;
                    }
                }
            }));

            _this.Item = Item;
            return _this;
        }

        return List;
    }(windsock.Bind);

    var template$1 = '<ul class="todo-list"></ul>';

    var parse$1 = function parse(template, component) {
        var list = new List(Todo);
        list.render(template, state, 'todos');
    };

    var compile$2 = function compile(compiled, component) {};

    var components$1 = {
        todo: Todo
    };
    //the todo instance that is passed to the Todo compile function is not the same
    //as the instance bound to the temp

    var Todos = function (_Component) {
        babelHelpers.inherits(Todos, _Component);

        function Todos(_ref) {
            var root = _ref.root;
            babelHelpers.classCallCheck(this, Todos);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Todos).call(this, {
                selectors: {
                    name: 'todos',
                    compile: {
                        class: 'todo-list'
                    }
                },
                components: components$1,
                template: template$1,
                parse: parse$1,
                compile: compile$2,
                root: root
            }));
        }

        return Todos;
    }(windsock.Component);

    var text = new windsock.Bind(function (node, binding) {
        var target = binding.target || binding;
        node.children[0].text = target.parent[target.key];
    });

    var length = new Conditional(function (node, target) {
        return target.parent[target.key].length;
    });

    var link = new windsock.Bind(function (node, binding) {
        var target = binding.target || binding,
            path = '#/' + target.parent[target.key];

        if (node.attributes.href === path) {
            if (node.compiled) {
                if (!node.attributes.class) {
                    node.attributes.add('class', 'selected');
                    return;
                }
            }
            node.attributes.class = 'selected';
        } else {
            if (node.compiled) {
                if (node.attributes.class) {
                    node.attributes.delete('class');
                }
            } else {
                if (node.attributes.class) {
                    delete node.attributes.class;
                }
            }
        }
        return {
            node: node,
            prop: 'class'
        };
    });

    var clear = new Conditional(function (node, target) {
        return target.parent.active < target.parent.todos.length;
    });

    var toggle = new windsock.Bind(function (node) {
        setChecked$1(node, state.active === 0 && state.todos.length);
    });

    function setChecked$1(checkbox, value) {
        if (checkbox.compiled) {
            checkbox.DOMNode.checked = value;
        }
    }

    var template = '\n<section class="todoapp">\n    <header class="header">\n        <h1>todos</h1>\n        <input class="new-todo" placeholder="What needs to be done?" autofocus>\n    </header>\n    <section class="main">\n        <input class="toggle-all" type="checkbox">\n        <label for="toggle-all">Mark all as complete</label>\n        <todos></todos>\n    </section>\n    <footer class="footer">\n    <span class="todo-count"><strong>0</strong> item left</span>\n    <ul class="filters">\n      <li>\n        <a class="selected" href="#/">All</a>\n      </li>\n      <li>\n        <a href="#/active">Active</a>\n      </li>\n      <li>\n        <a href="#/completed">Completed</a>\n      </li>\n    </ul>\n    <button class="clear-completed">Clear completed</button>\n    </footer>\n</section>\n<footer class="info">\n    <p>Double-click to edit a todo</p>\n    <p>Created by <a href="github.com/bsawyer/windsock">Ben Sawyer</a></p>\n    <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>\n</footer>';

    var parse = function parse(template, component) {
        var footer = template.find('footer');
        length.render(footer, state, 'todos');
        link.render(footer.filter('a'), state, 'route');
        clear.render(footer.find({ class: 'clear-completed' }), state);
        text.render(footer.find('strong'), state, 'active');
        toggle.render(template.find({ class: 'toggle-all' }), state, 'active');
    };

    var compile$1 = function compile(compiled, component) {
        compiled.find({ class: 'new-todo' }).on('keyup', function (e, input) {
            if (e.keyCode === 13 && input.DOMNode.value) {
                store.dispatch('add', input.DOMNode.value);
                input.DOMNode.value = '';
            }
        });
        compiled.find({ class: 'clear-completed' }).on('click', function () {
            store.dispatch('clear', true);
        });
        compiled.find({ class: 'toggle-all' }).on('change', function (e, node) {
            store.dispatch('toggle', true, node.DOMNode.checked);
        });
    };

    var components = {
        todos: Todos
    };

    var options = {
        selectors: 'app',
        template: template,
        parse: parse,
        compile: compile$1,
        components: components
    };

    var App = function (_Component) {
        babelHelpers.inherits(App, _Component);

        function App() {
            babelHelpers.classCallCheck(this, App);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, options));
        }

        return App;
    }(windsock.Component);

    var app = new App();

    windsock.router.register('#', {
        activate: function activate() {
            store.dispatch('route', '');
        }
    });
    windsock.router.register('#/active', {
        activate: function activate() {
            store.dispatch('route', 'active');
        }
    });
    windsock.router.register('#/completed', {
        activate: function activate() {
            store.dispatch('route', 'completed');
        }
    });

    windsock.router.start();

}));