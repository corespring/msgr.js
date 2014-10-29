//dispatcher-spec.js

describe('dispatcher', function(){

  function MockWindow(name, targetMessageHandler){

    var cbs = {};
    this.name = name;
    this.contentWindow = {
      postMessage: function(msg, origin){
        console.debug(name, 'handle message...', msg);
        if(targetMessageHandler){
          targetMessageHandler(msg);
        }
      }
    };

    this.addEventListener = function(name, cb){
      cbs[name] = cb;
    };

    this.ready = function(srcWindow){
      var event = {
        source: srcWindow,
        data: JSON.stringify({
          mode: 'receiver-ready'
        })
      };
      cbs.message(event); 
    };
  }
  
  it('construct', function(){
    var source = new MockWindow('source');
    var target = new MockWindow('target');
    var d = new msgr.Dispatcher(source, target);
    expect(d).not.toBe(undefined);
  });

  it('should allow you to add data to send', function(){
    var received;
    var source = new MockWindow('source');
    var handleMessage = function(msg){
      received = JSON.parse(msg);
    };  
    var target = new MockWindow('target', handleMessage);
    var d = new msgr.Dispatcher(source, target, {enableLogging: false});
    d.send('apple', {name: 'Granny Smith'});
    //Need to notify the dispatcher that we are ready...
    source.ready(target.contentWindow);
    expect(received.data.name).toEqual('Granny Smith');
  });
});