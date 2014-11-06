describe('receiver', function(){

  function MockWindow(name, targetMessageHandler){

    this.location = {
      pathname: name
    };

    var cbs = {};
    this.name = name;

    this.postMessage = function(msg, origin){
      console.debug(name, 'handle message...', msg);
      if(targetMessageHandler){
        targetMessageHandler(msg);
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
    var d = new msgr.Receiver(source, target);
    expect(d).not.toBe(undefined);
  });

  // function assertSend(t, d, cb){
  //   var received;
  //   var source = new MockWindow('source');
  //   var handleMessage = function(msg){
  //     received = JSON.parse(msg);
  //   };
  //   var target = new MockWindow('target', handleMessage);
  //   var dispatcher = new msgr.Dispatcher(source, target, {enableLogging: false});
  //   dispatcher.send(t, d);
  //   //Need to notify the dispatcher that we are ready...
  //   source.ready(target);
  //   cb(received);
  // }
  //
  // it('should allow you to add data to send', function(){
  //   assertSend('apple', {name: 'Granny Smith'}, function(received){
  //     expect(received.data.name).toEqual('Granny Smith');
  //   });
  // });
  //
  // it('should allow you to just fire and forget w/ no data', function(){
  //   assertSend('apple', null, function(received){
  //     expect(received.messageType).toEqual('apple');
  //   });
  // });
});
