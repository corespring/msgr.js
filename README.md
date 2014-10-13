# msgr.js

asynchronous 2 way messaging between a parent page and an iframe that uses `postMessage`


* support multiple instances (aka 1 iframe, removed then another iframe)
* support simultaneous instances (lower prio)
* lightweight

## Usage

### Parent

    var channel = new Msgr(iframe);

    channel.send('x..');

    channel.open();
    channel.close();
    channel.destroy();

    msgr.send("#iframe1", "ping", { message: 'banana'}, function(err, result){

      console.log('>', result.message); // > you said banana
    });

    msgr.on('hello', function(data, done){
      done(null, 'hello back');
    });


### Child

    msgr.on("ping", function(data, done){
      done(null, { message: 'you said: ' + data.message})
    });

    msgr.send('parent', 'hello', {}, function(err, data){
      console.log(data); // hello back
    });
