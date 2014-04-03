development of

write for node in sub dir
watch files, concat and polyfil for client, provide src dir for npm

to develop with
1.  just mirror development of proccess including in your client side the client compiled version.
    - works but what if i just want to require('teal') on the server without  and use teal in client side script?

meteor pushes state to and from server. we're not going to handle that. client side you can know when data changes and push yourself or listen for socket from server and push changes to dom by manipulating existing data objects

client script can be run from the server however within the files directory needs to be all the deps so its kinda dumb
