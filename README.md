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


