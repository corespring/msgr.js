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

      if(cbs.message){

        var event = {
          source: this,
          data: msg
        };
        cbs.message(event);
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

  function assertReceive(listenerType, messageHandler, assertResult, messageType){

    messageType = messageType || listenerType;

    messageHandler = messageHandler || function(data, done){
      done(null, messageType + '-received');
    };

    assertResult = assertResult || function(r){
      expect(r.result).toBe(messageType + '-received');
    };

    var source = new MockWindow('source');

    var resultFromReceiver = null;

    var target = new MockWindow('target', function(msg){
      resultFromReceiver = JSON.parse(msg);
    });
    var d = new msgr.Receiver(source, target);

    d.on(listenerType, messageHandler );

    var request = {
      messageType: messageType,
      mode: 'request',
      uid: 1
    };
    source.postMessage(JSON.stringify(request));
    assertResult(resultFromReceiver);
  }

  it('on - specific', function(){
    assertReceive('msg');
  });

  it('on - *', function(){
    assertReceive('*',
      function(name, data, done){
        done(null, 'got-' + name);
      },
      function(r){
        expect(r.result).toBe('got-banana');
        expect(r.messageType).toBe('banana');
      },
      'banana'
    );
  });

});
