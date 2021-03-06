(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('windsock')) :
  typeof define === 'function' && define.amd ? define(['windsock'], factory) :
  (factory(global.windsock));
}(this, function (windsock) { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
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

  var inherits = function (subClass, superClass) {
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

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var Item = function (_Component) {
      inherits(Item, _Component);

      function Item(options, data) {
          classCallCheck(this, Item);

          if (!options.template) {
              throw new Error('Item component requires a template');
          }

          var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Item).call(this, options));

          _this.data = data;
          return _this;
      }

      createClass(Item, [{
          key: 'render',
          value: function render() {
              var c = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

              var vdom = windsock.clone(this.template, true);
              vdom = this.parse && this.parse(vdom, this) || vdom;
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
          node.find({ class: 'toggle' }).on('change', function (e, n) {
              store.dispatch('toggle', state.todos.indexOf(todo));
          });
          node.find('button').on('click', function (e, n) {
              store.dispatch('clear', state.todos.indexOf(todo));
          });
          input.on('focus', function (e, n) {
              n.DOMNode.value = n.DOMNode.value;
          });
          input.on('blur', function (e, n) {
              store.dispatch('editing', null);
              if (n.DOMNode.value.length) {
                  store.dispatch('edit', todo, n.DOMNode.value);
              } else {
                  store.dispatch('clear', state.todos.indexOf(todo));
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
      inherits(Conditional, _Bind);

      function Conditional(predicate) {
          var remove = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
          classCallCheck(this, Conditional);

          var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Conditional).call(this, function (node, binding) {
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

      createClass(Conditional, [{
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
              return !node.class.contains('completed');
              break;
          case 'completed':
              return node.class.contains('completed');
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
              node.class.add('editing');
              if (node.compiled) {
                  setTimeout(function () {
                      node.find({ class: 'edit' }).DOMNode.focus();
                  }, 10);
              }
          } else {
              node.class.remove('editing');
          }
      }
  });

  var template$2 = '\n<li class="completed">    <div class="view">        <input class="toggle" type="checkbox" checked>        <label>Taste JavaScript</label>        <button class="destroy"></button>    </div>    <input class="edit" value="Create a TodoMVC template"></li>';

  var Todo = function (_Item) {
      inherits(Todo, _Item);

      function Todo(_ref, data) {
          var root = _ref.root;
          classCallCheck(this, Todo);
          return possibleConstructorReturn(this, Object.getPrototypeOf(Todo).call(this, {
              root: root,
              selectors: {
                  name: 'todo',
                  compile: 'li'
              },
              template: template$2
          }, data));
      }

      createClass(Todo, [{
          key: 'parse',
          value: function parse(template) {
              item.render(template, this.data);
              completed.render(template, state, 'route');
              editing.render(template, state, 'editing');
          }
      }]);
      return Todo;
  }(Item);

  var List = function (_Bind) {
      inherits(List, _Bind);

      function List(Item) {
          classCallCheck(this, List);

          var _this = possibleConstructorReturn(this, Object.getPrototypeOf(List).call(this, {
              bind: function bind(parent, target) {
                  var item = void 0;
                  target.value.forEach(function (data) {
                      item = new _this.Item({
                          root: false
                      }, data);
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

  var list = new List(Todo);

  var components$1 = {
      todo: Todo
  };
  //the todo instance that is passed to the Todo compile function is not the same
  //as the instance bound to the temp

  var Todos = function (_Component) {
      inherits(Todos, _Component);

      function Todos(_ref) {
          var root = _ref.root;
          classCallCheck(this, Todos);
          return possibleConstructorReturn(this, Object.getPrototypeOf(Todos).call(this, {
              root: root,
              selectors: {
                  name: 'todos',
                  compile: {
                      class: 'todo-list'
                  }
              },
              components: components$1,
              template: template$1
          }));
      }

      createClass(Todos, [{
          key: 'parse',
          value: function parse(template) {
              list.render(template, state, 'todos');
          }
      }]);
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
          node.class.add('selected');
      } else {
          node.class.remove('selected');
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

  var components = {
      todos: Todos
  };

  var options = {
      selectors: 'app',
      template: template,
      components: components
  };

  var App = function (_Component) {
      inherits(App, _Component);

      function App() {
          classCallCheck(this, App);
          return possibleConstructorReturn(this, Object.getPrototypeOf(App).call(this, options));
      }

      createClass(App, [{
          key: 'parse',
          value: function parse(template) {
              var footer = template.find('footer');
              length.render(footer, state, 'todos');
              link.render(footer.filter('a'), state, 'route');
              clear.render(footer.find({ class: 'clear-completed' }), state);
              text.render(footer.find('strong'), state, 'active');
              toggle.render(template.find({ class: 'toggle-all' }), state, 'active');
          }
      }, {
          key: 'compile',
          value: function compile(compiled) {
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
          }
      }]);
      return App;
  }(windsock.Component);

  var app = new App();

  windsock.router.register('');
  windsock.router.register('active');
  windsock.router.register('completed');

  windsock.router.start({
      otherwise: '',
      post: function post(req) {
          store.dispatch('route', req.resolved);
      }
  });

}));