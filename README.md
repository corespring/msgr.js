# msgr.js

An asynchronous 2 way messaging api for communication between web documents built with `postMessage`.

## Browsers
* ie8+
* Firefox
* Chrome
* Safari


root.html
```javascript
    var channel = msgr.Channel(window, iframe);
    channel.on('msg-from-iframe', function(data, done){
        //.. do stuff
    });

    channel.send('msg-to-iframe', {name: 'Ed'}, function(err, result){
        //.. do stuff
    });
```

child.html
```javascript
   var channel = msgr.Channel(window, window.parent);
   channel.on('msg-to-iframe', function(data, done){
      //..
   });

   channel.send('msg-from-iframe', 'hi!', function(err, result){

   });
```


* support multiple instances (aka 1 iframe, removed then another iframe)
* support simultaneous instances (lower prio)
* lightweight

## Develop

    npm install
    grunt watch

## Run

    python -m SimpleHTTPServer

    http://localhost:8000/test/samples/two/root.html
    http://localhost:8000/test/samples/add-remove-add/root.html

## Release

    grunt bump


## Tests
We have some unit tests

    grunt test

We have some local ui tests :

    grunt regression #will run the local tests

And the same tests running on sauce labs:

    grunt webdriver:sauceLabs #will run the ie8 tests on saucelabs

You'll need the following env vars set:
* SAUCE_USERNAME
* SAUCE_PASSWORD
* MSGR_BASE_URL

You'll also need to deploy the files somewhere sauce labs can access them, at the moment we have corespring-msgr.herokuapp.com set up ping ed for access.


## Usage


There is 1 main class `msgr.Channel` which is a combination of: `msgr.Dispatcher` and `msgr.Receiver`.

`msgr.Channel` allows access to `Receiver.on(...)` and `Dispacher.send(...)`.

There is also a `remove()` method that you should call once you are done, this will remove all the event listeners.
