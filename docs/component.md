# Component

The `Component` class can be used to encapsulate higher level application logic, providing lifecycle hooks for each stage in the process of composing a virtual DOM.

# Class: Component

``` javascript
import Component from 'windsock';

let component = new Component(options);

class Custom extends Component{
    constructor(options){
        super(options);
    }
}
```

# new Component(options)

Instantiates a new `Component` with an `options` object. By default a component will be created as a root component, querying the live DOM and eventually replacing the source nodes.

In order to query the live DOM, the `Component` class uses querySelectorAll internally to find the source nodes associated with the component.

- **options** `Object`
    - **root** `Boolean`

    Default `true`
    Whether or not the component is to render in the DOM
    - **components** `Object`

    Default `{}` Registered components
    - **selectors** `String|Object`

    Default `''` An element name selector or an object `{name:'custom', compile:'div'}`
    - **template** `String|Array|Node`

    Template to replace the source node
    - **query** `Function(component, DOMNode)`

    Read only callback

    Avoid manipulating or attaching events to the DOM in this callback
    - **parse** `Function(template, component, node)`

    Read/write/replace callback

    The parse method is the only callback that allows returning a value for replacing the template passed to it
    - **compile** `Function(compiledNode, component, template)`

    Read/write callback

Creating a new `Component` will initialize it's query/parse/compile lifecycle as well as any child components registered with it.

## Static: Component.selector(component, type)

A method for mapping a selector given a contextual `type` string.
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

## Static: Component.query(component, DOMNode)

A method for querying a DOM node using calling querySelectorAll with the components `selector.name` value.
``` javascript
Component.query(component, DOMNode);
```

## Static: Component.parse(component, sources)

A method for iterating over a list of of either DOM nodes or parent parsed virtual DOM
nodes filtered by the components `selector.name` value. Also queries the newly parsed virtual DOM for each registered component, invoking parse on them. This method calls the registered parse callback on the component if it exists.

``` javascript
Component.parse(component, sources);
```

If a parent component's `parse` callback changes it's structure from that of the source the child will parse the newly queried parent templates. However, if the parents parse doesn't modify the structure at all, the child's source elements will be bound to the appropriate template and a query of the parent template will return the parsed templates of the child source nodes. The query selector used for querying the live DOM and the parent template will be the name selector. It is then up to the child whether or not to provide a new selector for compilation stage.

## Static: Component.compile(component, templates)

A Method for iterating over a list of parsed nodes and compiling them. Also queries the newly compiled virtual DOM for each registered component, invoking compile on them. This method calls the registered compile callback on the component if it exists.

``` javascript
Component.compile(component, templates);
```

The same process is repeated for compilation to provide the components a chance to do any further work in the templates prior to tranclusion into the DOM. The same scenario applies here where if the parent modifies the compiled DOM.