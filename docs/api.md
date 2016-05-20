# vdom

The `vdom` is a collection of classes that represent the basic nodes that comprise the DOM

## Node
The `Node` is the base virtual node extended by other nodes
> Do not instantiate or extend this class as it is not intended to directly map to any specific document node but rather be extend from exclusively

## Instance

### Properties

#### `node.jsonml`
Read-only property for returning the node as a formatted JSONML array

#### `node.html`
Read-only property for returning the node as a formatted HTML string

### Methods

#### `node.index()`
Returns the current index of the node in the `parent.children` array

## Text
The `Text` is a virtual representation of a TextNode that extends Node

## Fragment

The `Fragment` is a virtual representation of a DocumentFragment that extends Node

## Element

The `Element` is a virtual representation of a DocumentElement that extends Fragment

## Instance

``` javascript
import Element from 'windsock';

const element = new Element(name, attributes, empty);
```

### Properties

#### `element.name`

#### `element.attributes`

#### `element.empty`

### Methods

#### `element.index()`

# `parse(source)`

# `compile(template)`

# `transclude(compiled)`

# `clone(vdom)`

# Component

# Bind

# Http

The `Http` class wraps an xhr client with template urls, promises, and exposes an interceptor pattern for all requests

# Instance

``` javascript
import Http from 'windsock';

const http = new Http(config);
```

## Properties

## Methods

# router

The `router` is a singleton object that exposes methods for registering and routing the locations pathname.

## Methods

### `router.register(path, config)`
Registers a state configuration obj at path on the states singleton registry

### `router.go(path, params)`
Adds a state request with parameters to the queue to be processed

### `router.start(config)`
Starts the router by adding event listeners to hashchange or popstate based on `config.hash`

### `router.stop()`
Removes the event listener on the window

## state

A state configuration object is responsible for determining whether or not a state can be activated/deactivated. It's optional to return a promise in either callback to resolve or reject preventing that route request from completing.

### path
A string representing the desired url, supports template segments
``` javascript
router.register('user/:id', state);

router.go('user/:id', {
    path: {
        id: 1
    }
});
```

### config
- activate `Function`

    A function to call when the state is activated or reactivated

- deactivate `Function`

    A function to call when the state is deactivated


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