# vdom

The `vdom` is a collection of classes that represent the basic nodes that comprise the DOM.

> Originally, windsock was just a library for structuring and manipulating a virtual DOM. At it's core the three main methods for working with virtual nodes have been unchanged. A virtual DOM is responsible for maintaining an in memory representation of the live DOM on the client, or an HTML/JSONML compliant string in a Nodejs environment.

# `parse(source)`

The parse method is used to create and return an uncompiled virtual DOM fragment. It takes either an HTML string, JSONML Array, or DocumentElement.

# `compile(template)`

The compile method is used for compiling a parsed virtual DOM node. It returns an observable, JSONML compliant deep clone of the virtual DOM and its events.

# `transclude(compiled)`

The transclude method is used to replace the original live node with the virtual compiled node.

# `clone(vdom)`

The clone method is used create a cloned instance of a node and determining whether or not to compile it.

> The main goal of a virtual DOM is once the nodes associated with a virtual node are live, changes to the virtual node can be observed and batch updated in the live DOM to have the smallest footprint. This coupled with the ability to manipulate your nodes prior to any actual document Node being instantiated makes having a virtual representation of the DOM a great performance optimization.

## Node

The `Node` is the base virtual node extended by other nodes.

## Instance

> Do not instantiate or extend this class as it is not intended to directly map to any specific document node but rather be extend from exclusively.

### Properties

#### `node.jsonml`
Read-only property for returning the node as a formatted JSONML array

#### `node.html`
Read-only property for returning the node as a formatted HTML string

### Methods

#### `node.destroy()`
Reverts the nodes properties to their initial or undefined values. Disconnects any observers and removes events and bindings.

#### `node.clone()`
A function for creating a new node with the same values.

#### `node.on(evt, callback, capture)`
A function for adding a callback that will be deeply cloned and added to the DOMNode event listeners once compiled.

#### `node.off(evt, callback)`
A function for removing a callback registered under and events namespace. If callback is missing all the callbacks registered with the event name will be removed.

## Text
The `Text` is a virtual representation of a TextNode that extends Node.

## Instance

``` javascript
import Text from 'windsock';

const text = new Text(value);
```

### Properties

### `text.text`
Get/ set property for returning the text value of the node.

## Fragment

The `Fragment` is a virtual representation of a DocumentFragment that extends Node.

## Instance

``` javascript
import Fragment from 'windsock';

const fragment = new Fragment();
```

### Methods

#### `fragment.append(node)`
A function for pushing the node onto the fragments children array

#### `fragment.prepend(node)`
A function for unshifting the node onto the fragments children array

#### `fragment.insert(node, i)`
A function for splicing the node into the fragments children array at index `i`

#### `fragment.find(query)`
A function for returning the first node that matches the queries criteria. The query is either a string which matches the elements name, an object that matches the elements attributes, or a function that evaluates against all nodes.

#### `fragment.filter(query)`
A function returning a flat list of results from an in-order recursive traversal of the fragments children.

#### `fragment.text()`
A function for returning a concatenated string of all the children text nodes values.

## Element

The `Element` is a virtual representation of a DocumentElement that extends Fragment.

## Instance

``` javascript
import Element from 'windsock';

const element = new Element(name, attributes, empty);
```

### Properties

#### `element.name`
The name of the element

#### `element.attributes`
An object map representing the elements attributes

#### `element.empty`
Boolean value indicating whether or not the element is empty/self closing

#### `element.class`
Read-only property for returning a `classList` object for manipulating the element classes

##### Methods
- `element.class.toggle(str)`

    Toggles the existence of a single class name. Throws an error for invalid class name.

- `element.class.add(str)`

    Appends a single class name if it does not already exist. Throws an error for invalid class name.

- `element.class.remove(str)`

    Removes a single class name if it exists. Throws an error for invalid class name.

- `element.class.contains(str)`

    Returns a boolean value whether the class exists. Throws an error for invalid class name.

- `element.class.index(str)`

    Returns a index of class if exists otherwise -1. Throws an error for invalid class name.

### Methods

#### `element.index()`

Returns the current index of the node in the `parent.children` array

# Observer

The `Observer` class creates observable objects and binds accessor methods and properties based on the target.

# Instance

``` javascript
import Observer from 'windsock';

let observer = new Observer(callback);
```

## callback `function`
A function to invoke on mutation. Callback is passed the `MutationRecord`.

## MutationRecord
- type `String|Number`

    Property on observable that was modified

- target `Object|Array`

    The target observable object

- method `String`

    The mutation method

- args `Array`

    The arguments passed to the mutation method

- newValue `Any`

    The new value assigned to the target at type

- oldValue `Any`

    The old value on target at type

## Methods

### `observer.observe(target, recursive)`
Converts a target into an observable object

- target `Object|Array`

    The targets current properties are converted in to accessors and augmented with appropriate mutation methods.

- recursive `Boolean`

    Whether or not to also observer child Objects|Arrays, defaults to false

### `observer.disconnect()`
Removes itself from target observers list and removes reference to target.

## Observable

> Some mutation methods must be defined on objects in order to track changes as accessor functions only work for existing properties.
The array mutation methods simply forward their arguments to the associated method on the Array.prototype, windsock does not modify the Array.prototype.

### Observable Methods
- `object.add(key, value)`

    Adds a value at the specific key on the object

- `object.delete(key)`

    Deletes a property on an object

- `array.fill(...)`

    Invokes Array.prototype.fill

- `array.pop(...)`

    Invokes Array.prototype.pop

- `array.push(...)`

    Invokes Array.prototype.push

- `array.shift(...)`

    Invokes Array.prototype.shift

- `array.splice(...)`

    Invokes Array.prototype.splice

- `array.unshift(...)`

    Invokes Array.prototype.unshift


# Component

The `Component` class can be used to encapsulate higher level application logic, providing lifecycle hooks for each stage in the process of composing a virtual DOM.

# Instance

``` javascript
import Component from 'windsock';

let component = new Component(options);
```

> Creating a new `Component` will initialize it's query/parse/compile lifecycle as well as any child components registered with it.

## options `Object`

- root `Boolean`

    Default `true`
    Whether or not the component is to render in the DOM

- components `Object`

    Default `{}` Registered components

- selectors `String|Object`

    Default `''` An element name selector or an object `{name:'custom', compile:'div'}`

- template `String|Array|Node`

    Template to replace the source node

- query `Function(component, DOMNode)`

    Read only callback

    Avoid manipulating or attaching events to the DOM in this callback

- parse `Function(template, component, node)`

    Read/write/replace callback

    The parse method is the only callback that allows returning a value for replacing the template passed to it

- compile `Function(compiledNode, component, template)`

    Read/write callback

## Static Methods

### `Component.selector(component, type)`
A function for mapping a selector given a contextual `type` string.

``` javascript
let component = new Component({
    selector: {
        name: 'div',
        compile: 'ul'
    }
});

Component.selector(component); //returns 'div'

Component.selector(component, 'compile'); //returns 'ul'
```

### `Component.query(component, DOMNode)`
A function for querying a DOM node using calling querySelectorAll with the components `selector.name` value.

### `Component.parse(component, sources)`
A function for iterating over a list of of either DOM nodes or parent parsed virtual DOM nodes filtered by the components `selector.name` value. Also queries the newly parsed virtual DOM for each registered component, invoking parse on them. This method calls the registered parse callback on the component if it exists.

> If a parent component's `parse` callback changes it's structure from that of the source the child will parse the newly queried parent templates. However, if the parents parse doesn't modify the structure at all, the child's source elements will be bound to the appropriate template and a query of the parent template will return the parsed templates of the child source nodes. The query selector used for querying the live DOM and the parent template will be the name selector. It is then up to the child whether or not to provide a new selector for compilation stage.

### `Component.compile(component, templates)`
A function for iterating over a list of parsed nodes and compiling them. Also queries the newly compiled virtual DOM for each registered component, invoking compile on them. This method calls the registered compile callback on the component if it exists.

> The same process is repeated for compilation to provide the components a chance to do any further work in the templates prior to tranclusion into the DOM. The same scenario applies here where if the parent modifies the compiled DOM.

# Bind

The `Bind` class is responsible for defining data bindings between virtual nodes and observables

# Instance

``` javascript
import Bind from 'windsock';

const bind = new Bind(transform, recursive);
```

## transform `Object|Function`

> If `transform` is a function it gets set to both bind and update

- bind `Function`

    A function that is invoked when the node is initially rendered with the target data. It can optionally return an object that defines what namespace to register the binding at on the node.

- update `Function`

    A function that is invoked every time there is a mutation to the observed target. It is passed the `node`, `binding` and `mutation` objects.

- compile `Function`

    A function that is invoked when the node is compiled. It is passed the compiled `node` and `binding` object.

## recursive `Boolean`
A boolean value determining whether or not the target object it recursively observed. Defaults to `false`.

## Methods

### `bind.render(node, target, keypath)`
A function for creating the binding object and adding it to the list of bindings on the uncompiled node. Optionally observes the target at a period delimited `keypath`.

```javascript
let data = {
    obj: {
        arr: [{
            prop: 'value'
        }]
    }
};

bind.render(node, data, 'obj.arr.0.prop');
```

# Http

The `Http` class wraps an xhr client with template urls, promises, and exposes an interceptor pattern for all requests

# Instance

``` javascript
import Http from 'windsock';

const http = new Http(config);
```

## config
- urlencode `Boolean`

    Defaults to false, whether or not to url encode data

- override `Boolean`

    Defaults to false, whether or not to override PUT|PATCH|DELETE requests as POST with X-HTTP-Method-Override header

- timeout `Number`

    Defaults to 0, time before a request is aborted, if 0, no request will be aborted

- headers `Object`

    Object map of key/value pairs

- url `String`

    Defaults to an empty string, parsed to a url object and passed to interceptors

## Properties

### `http.url`
Read-only property, returns the formatted url

### `http.query`
Get or set the url query parameters

### `http.path`
Get or set the url path parameters


## Methods

### `http.GET(data)`
A function for making a `GET` request with specified data

### `http.POST(data)`
A function for making a `POST` request with specified data

### `http.PUT(data)`
A function for making a `PUT` request with specified data

### `http.PATCH(data)`
A function for making a `PATCH` request with specified data

### `http.DELETE(data)`
A function for making a `DELETE` request with specified data

## Static Methods

### `Http.method(http, method, data)`
A function that returns a request configuration object that can be used to executed a request with `Http.request()`

### `Http.request(request)`
A function for executing a request with provided configuration object

## Static Properties

### `Http.interceptors.request`
A `Signal` instance that is dispatched with every request

### `Http.interceptors.response`
A `Signal` instance that is dispatched with every response

# router

The `router` is a singleton object that exposes methods for registering and routing the locations pathname.

## Methods

### `router.register(path, config)`
Registers a state configuration obj at a path name on the states object. Will throw an error for invalid path or if the config is not an object.

``` javascript
router.register('user/:id', state);

router.go('user/:id', {
    path: {
        id: 1
    }
});
```

#### path `String`
A string representing the desired url, supports parameters

#### config `Object`
- activate `Function`

    A function to call when the state is activated or reactivated. Optionally return a `Promise` to resolve or reject preventing the route request from completing. It is passed the `request` object.

- deactivate `Function`

    A function to call when the state is deactivated. Optionally return a `Promise` to resolve or reject preventing the route request from completing. It is passed the `request` object.

##### request `Object`

- segments `Array`

    An array of the segments to activate

- requested `String`

    A string path that go was originally called with.

 - resolved `String`

    A string representing the path that was resolved.

- target `String`

   A string representing the current target of the request being handled.

- previous `Request`

    The previously activated request object.

- path `Object`

    An object map of the variable path segments.

- query `Object`

    An object map of the query parameters.

- replace `Boolean`

    A boolean value indicating whether or not the request is to replace the history state.

- event `Event`

    An event object if any is associated with the request.

- promise `Promise`

    A promise that is either resolved or rejected with the `request` object.

### `router.go(path, params)`
Adds a state request with parameters to the queue to be processed. Returns a `Promise` that is either resolved or rejected when the requested path is handled. Will throw an error if starts or ends with a `/` or if the path has parameter(s) that are not defined in params object.

#### path `String`
A string representing the desired url, supports parameters.

#### params `Object`

- path `Object`

    An object map that will populate the path parameter with values.

- query `Object`

    An object map that will populate the query parameters with values.

 - replace `Boolean`

    A boolean value indicating whether or not replace the previous history entry.

### `router.start(config)`
Starts the router by adding event listeners to hashchange or popstate based on `config.hash`. Will throw an error if already listening, please check if started `router.started()`.

#### config `Object`
- hash `Boolean`

    A boolean value indicating whether or not use hashed paths. Defaults to true.

- root `String`

    A string value to register root paths at. Defaults to 'root'.

- reactivate `Boolean`

    A boolean value indicating whether or not to call activate on states already activated on a new request.

- otherwise `String`

    An otherwise path to route when popstate or hashchange are emitted with an invalid path or go is called with an unregistered path.

### `router.stop()`
Removes the event listener on the window. Will throw an error if not listening, please check if started `router.started()`.

### `router.started()`
Returns a boolean value indicating if the router has been started.

### `router.reset()`
Resets all the initial values of the router.

# Store

The `Store` class is responsible for providing structure to the process of mutating models.

# Instance

``` javascript
import Store from 'windsock';

const store = new Store(state, mutations, post);
```

## Properties

### `store.state`
A target object or array to mutate

### `store.mutations`
A registry of methods(synchronous operations only) that mutate the state

### `store.post`
A callback function that is called whenever a mutation is performed

# Signal

The `Signal` class retains a list of listener methods that are called whenever the signal is dispatched.

# Instance

``` javascript
import Signal from 'windsock';

const signal = new Signal();
```

## Methods

### `signal.add(listener)`
Pushes the listener method onto the array of listeners

### `signal.remove(listener)`
Removes a method from the listeners array, if no listener is provided, sets the listeners to an empty array

### `signal.dispatch(...args)`
Iterates over the listeners and invokes them with the arguments passed to dispatch

## Properties

### `signal.listeners`
An array of methods

# url

Utility methods for parsing and formatting urls including template paths and query string mapping

## Methods

### `url.parse(str)`
Returns an object map of the url

### `url.format(obj)`
Returns a formatted url string

### `url.path.parse(str)`
Returns an object map of the path string

### `url.path.format(obj)`
Returns a formatted path string

### `url.query.parse(str)`
Returns an object map of the query string

### `url.query.format(obj)`
Returns a formatted query string

# util

Utility methods used internally by windsock

# Methods
The `util` module has the following methods:

### `util.paint(fn)`
References requestAnimationFrame with a fallback to setTimeout

### `util.cancelPaint(fn)`
References cancelAnimationFrame with a fallback to clearTimeout

### `util.tick(fn)`
References process.nextTick with a fallback to setTimeout

### `util.capitalize(str)`
Returns a new string with the first character converted toUpperCase

### `util.is(target, type)`
Returns a boolean value whether a target is of type

### `util.extend(obj, ...args)`
Iterates enumerable properties including the prototype on each object and sets them equal to their value on obj

### `util.clone(obj)`
Recursively iterates enumerable properties not including prototype and nested objects creating new objects and assigning the values

### `util.match(obj, query)`
Returns a boolean value whether all the enumerable properties including the prototype on the query object strictly equal the obj properties

### `util.noop()`