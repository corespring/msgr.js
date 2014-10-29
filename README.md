# msgr.js

asynchronous 2 way messaging between a parent page and an iframe that uses `postMessage`


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

We have some ui tests 

    grunt regression


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