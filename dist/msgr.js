//msgr.js


(function(root){

  function Broker(source, target){

    this.send(name, callback){
      var messageUid = new Date().getTime() + '-' + Math.floor(Math.random() * 100);

      source.addEventListener('message', function(event){
        var data = event.data;
        if(data.uid === messageUid){
            source.removeEventListener('message', this);
            callback(null, data);
        }
      });

      target.postMessage(name, '*');
    }
  }

  function MessageListener(uid){
    window.addEventListener('message', function(event){

    });
  };

  function Msg(messageType, data){

    this.toString = function(){

      var out = {
        uid: 'uid_request'
        msgType: messageType,
        data: data
      }
    }
  };

  function MessageTarget(target){
    this.send = function(messageType, data, done){

      target.contentWindow.postMessage('messageType')
    }
  }

  //add a listener to window for 'message'

  //tear down listener

  function MessageChannel(target){

    var channelUid = new Date().getTime() + '-' + Math.floor(Math.random() * 100);

    var console = root.console;
    this.send = function(messageType, data, done){
      console.debug('send', arguments);


      messageTarget.send(messageType, data, done);
      //target.contentWindow.postMessage('...', '*')
    };

    this.on = function(name, callback){

      window.addEventListener('message', function(event){

      });
    }
  }
  root.msgr = root.msgr || {};
  root.msgr.MessageChannel = MessageChannel;
})(this);
