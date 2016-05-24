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

    var state = {
        awesome: true
    };

    var observer = new windsock.Observer(function (mutation) {
        console.log(mutation.newValue, mutation.oldValue);
    });

    observer.observe(state);

    state.awesome = false;
    state.delete('awesome');

    var mutations = {
        add: function add(state, id, user) {
            state.add(id, user);
        }
    };

    var store = new windsock.Store(state, mutations);

    store.dispatch('add', 1, { name: 'Mr. Meeseeks' });

    var bind = new windsock.Bind({
        bind: function bind(node, target) {
            var li = node.children[0],
                c = void 0;

            for (var id in target.value) {
                c = windsock.clone(li, true);
                c.children[0].text = target.value[id].name;
                node.append(c);
            }
        },
        compile: function compile(node, binding) {
            node.children[0].on('click', function () {
                setTimeout(function () {
                    store.dispatch('add', node.children.length, { name: 'Mr. Meeseeks' });
                }, 1000);
            });
        },
        update: function update(node, binding, mutation) {
            var c = void 0;

            switch (mutation.method) {
                case 'add':
                    c = windsock.clone(node.children[0], true);
                    c.children[0].text = mutation.newValue.name;
                    node.append(c);
                    break;
                case 'delete':
                    break;
                case 'set':
                    break;
            }
        }
    });

    var template = '<ul><li>add user</li></ul>';

    var parse = function parse(template) {
        bind.render(template, state);
    };

    var options = {
        root: true,
        selectors: {
            name: 'users',
            compile: 'ul'
        },
        template: template,
        parse: parse
    };

    var Users = function (_Component) {
        babelHelpers.inherits(Users, _Component);

        function Users() {
            babelHelpers.classCallCheck(this, Users);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Users).call(this, options));
        }

        return Users;
    }(windsock.Component);

    var users = new Users();

}));