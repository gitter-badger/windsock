# Observer

The `Observer` class creates observable objects and binds accessor methods and properties based on the target.

# Class: Observer

``` js
import Observer from 'windsock';

const observer = new Observer((mutationRecord)=>{});
```

# new Observer(callback)

- **callback** `Function`

    A method to invoke on mutation. Callback called with a mutation record.

# Observer Instance Methods

- **observe(target, recursive)**

    Converts a target into an observable object
    - target `Object|Array`
        The targets current properties are converted in to accessors and augmented with appropriate mutation methods.
    - recursive `Boolean`
        Whether or not to also observer child Objects|Arrays, defaults to false

- **disconnect()**

    Removes itself from target observers list and removes reference to target.

# MutationRecord
- **MutationRecord Instance Properties**
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

    The old value on target at type

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
