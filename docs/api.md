# API
### windsock.Observer

``` js
import Observer from 'windsock';
const observer = new Observer((mutationRecord)=>{});
```
#### windsock.Observer Constructor Parameters
- **callback** `Function`
A method to invoke on mutation. Callback called with a mutation record.

#### windsock.Observer Instance Methods

- **observe(target, recursive)**

    Converts a target into an observable object
    - target `Object|Array`
        The targets current properties are converted in to accessors and augmented with appropriate mutation methods.
    - recursive `Boolean`
        Whether or not to also observer child Objects|Arrays, defaults to false

- **disconnect()**

    Removes itself from target observers list and removes reference to target.

### MutationRecord
#### MutationRecord Instance Properties
- **type** `String|Number`
Property on observable that was modified
- **target** `Object|Array`
The target observable object
- **method** `String`
The mutation method
- **args** `Array`
The arguments passed to the mutation method
- **newValue** `Any`
The new value assigned to the target at type
- **oldValue** `Any`
sThe old value on target at type

### Observable
#### Observable Mutation Methods
- **add(key, value)**
- **delete(key)**
- **fill()**
- **pop()**
- **push()**
- **shift()**
- **splice()**
- **unshift()**

### windsock.Bind

### windsock.Store

### windsock.Http

### windsock.Component

### windsock.url

### windsock.router

### windsock.vdom

### windsock.parse()

### windsock.compile()

### windsock.clone()

### windsock.transclude()

### windsock.util
