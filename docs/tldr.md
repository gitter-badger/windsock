# tl;dr

Windsock was designed to be extended leveraging classes in es6. All classes can be used without extension and those familiar with observables or reactive stores can use them immediately.

# Creating an observable
``` javascript
import Observer from 'windsock';

const state = {
    awesome: true
}

let observer = new Observer((mutation)=>{
    console.log(mutation);
});

observer.observe(state);

```

Later you can update the state object and the observers callback will be invoked synchronously for each mutation.

``` javascript
state.awesome = false; // :(
state.delete('awesome');
```

# Creating a store
``` javascript
import Store from 'windsock';

let mutations = {
    add: (state, args)=>{
        let id = args[0],
            data = args[1];
        state.add(id, data);
    }
};

let store = new Store(state, mutations);
```
Now you can define an asynchronous operation to retrieve some data and dispatch the mutation.
> **NOTE:** Always keep mutation callbacks synchronous.

``` javascript
import Http from 'windsock';

let user = new Http({
    url: '/user/:id'
});

user.path.id = 1;

http.GET()
    .then((data)=>{
        store.dispatch('add', data);
    });
```

# Creating a Component
With your store and observable in place we can expose this to the user with a component. You can create a binding that observes the state model appending list items and attaching a click event that exposes a sample async method with a callback to dispatch the stores mutation.

First we have our users custom element which will be replaced by the component
``` html
<!DOCTYPE html>
<html>
    <head></head>
    <body>
        <users></users>
    </body>
</html>
```

Then we have our bind and instantiate our user component
``` javascript
import Bind from 'windsock';
import Component from 'windsock';
import parse from 'windsock';
import clone from 'windsock';

const bind = new Bind({
    bind: (node, target)=>{
        let li = node.children[0],
            c;
        for(let id in target.value){
            c = clone(li, true);
            c.children[0].text = target.value[id].name;
            node.append(c);
        }
    },
    compile: (node, binding)=>{
        node.children[0].on('click', ()=>{
            setTimeout(()=>{
                store.dispatch('add', 123, {name:'asd'});
            },1000);
        });
    },
    update: (node, mutation, binding)=>{
        let c;
        switch (mutation.method) {
            case 'add':
                c = clone(node.children[0], true);
                c.children[0].text = mutation.newValue.name;
                node.append(c)
                break;
            case 'delete':
                break;
            case 'set':
                break;
        }
    }
});

const template = '<ul><li>add user</li></ul>';

const parse = (template)=>{
    bind.render(template, state);
};

const options = {
    root: true,
    selector: {
        name: 'users',
        compile: 'ul'
    },
    template,
    parse,
};

class Users extends Component{
    constructor({root}){
        options.root = root;
        super(options);
    }
}

let user = new User('user');
```