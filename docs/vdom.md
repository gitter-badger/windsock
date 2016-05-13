# The Virtual DOM

Originally, windsock was just a library for structuring and manipulating a virtual DOM. At it's core the three main methods for working with virtual nodes has been unchanged. A virtual DOM is responsible for maintaining an in memory representation of the live DOM on the client, or an HTML/JSONML compliant string in a Nodejs environment.

The main goal of a virtual DOM is once the nodes associated with a virtual node are live, changes to the virtual node can be observed and batch updated in the live DOM to have the smallest footprint. This coupled with the ability to manipulate your nodes prior to any actual document Node being instantiated makes having a virtual representation of the DOM a valuable asset.

###parse()
The parse method is used to create and return an uncompiled virtual DOM fragment. It takes either an HTML string, JSONML Array, or DocumentElement.

###compile()
The compile method is used for compiling a parsed virtual DOM node. It returns an observable, JSONML compliant deep clone of the virtual DOM and its events.

###transclude()
The transclude method is used to replace the original live node with the virtual compiled node.

###clone()
The clone method is used create a cloned instance of a node and determining whether or not to compile it.