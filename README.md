# msgr.js

An asynchronous 2 way messaging api for communication between web documents built with `postMessage`.

root.html

    var channel = msgr.Channel(window, iframe);
    channel.on('msg-from-iframe', function(data, done){
        //.. do stuff
    });

    channel.send('msg-to-iframe', {name: 'Ed'}, function(err, result){
        //.. do stuff
    });


child.html

  var channel = msgr.Channel(window, window.parent);
  channel.on('msg-to-iframe', function(data, done){
      //..
  });

  channel.send('msg-from-iframe', 'hi!', function(err, result){

  });


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


There are 2 classes that you can use: `msgr.Dispatcher` and `msgr.Receiver`.

When used together across 2 documents (a root and an iframe), they simplify making requests from one to the other.

The dispatcher is used when you want to initiate a request and add a callback for it's response. It saves you from having to manage the postMessage response handling.

    var dispatcher = new msgr.Dispatcher(window, iframe);

    dispatcher.send('whatTimeIsIt', function(err, result){
      console.log('the time is', result);
    });

    //Then in the iframe you add:

    var receiver = new msgr.Receiver(window, window.parent);

    receiver.on('whatTimeIsIt', function(done){
      done(null, new Date().toString());
    });

### TODO

* callback is optional
* can pass in data
