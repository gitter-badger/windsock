(function(){

    //custom client polyfill for commonjs
    //not using strict in order to declare module and require on window
    //the only prerequisit for modules as objects is they need to have an inenumerable _ns
    //prop that's the same as their filename and module.exports is set afterward

    if(typeof module == 'undefined') {

        //declare on global once for client
        _exports = Object.create(null);

        module = {

            set exports(val){

                if(Object.prototype.toString.call(val) == '[object Function]'){

                    var ns = val._ns || val.toString().match(/function ([^\(]*)/)[1].toLowerCase();
                    //dirty, ie doesn't support fn.name
                    _exports[ns] = val;

                }else{

                    if(!val._ns) throw new Error('Export namespace missing');

                    _exports[val._ns] = _exports[val._ns] || {};

                    for(var key in val){

                        _exports[val._ns][key] = val[key];

                    }

                }

            },

            get exports(){

                return _exports;

            }

        };

    }

    if(typeof require == 'undefined') require = function(path){

        //possible sub folder namespacing path.match(/[^\/]*/g) .shift() for .. or . and .join('_')
        return module.exports[path.match(/[^\/]+$/).join()];

    };

    //global default configuration properties
    var config = {

        client: (typeof document !== 'undefined'),
        debug: true

    };

    Object.defineProperty(config, '_ns', {

            value: 'config',
            enumerable: false

    });

    module.exports = config;

})();
