

(function(root){

  function Dispatcher(source, target){

    window.messageHandlers = {};

    var getUid = function(){
      return new Date().getTime() + '-' + Math.floor(Math.random() * 100);
    }

    var brokerUid = 'Dispatcher';

    var callbacks = {};

    var handlePostMessage = function(event){
      console.log('Dispatcher - handlePostMessage', event.data);

      if(callbacks[event.data.uid]){
        callbacks[event.data.uid](event.data.err, event.data.result);
        callbacks[event.data.uid] = null;
      }
    }

    source.addEventListener('message', handlePostMessage);

    this.send = function(messageType, data, callback){
      var messageUid = getUid();
      console.log(brokerUid, 'send:', messageType, messageUid);
      if(callbacks[messageUid]){
        throw 'uid already exists: ' + messageUid;
      }
      callbacks[messageUid] = callback;
      var msg = { messageType: messageType, mode: 'request', uid: messageUid, data: name }
      target.contentWindow.postMessage(msg, '*');
    };
  }

  function Receiver(source, target){

    var domTarget = function(){
      if(target === 'parent' && parent != window){
        return parent;
      } else if(target && target.contentWindow){
        return target.contentWindow;
      }
    }

    var handlers = {};

    var handlePostMessage = function(event){

      console.log('Receiver - handlePostMessage: ', JSON.stringify(event.data));
      var data = event.data;

      if(data.messageType && handlers[data.messageType]){
        console.log('Receiver - call the handler for', data.messageType)
        handlers[data.messageType](data.data, function(err, result){

          var args = Array.prototype.slice.call(arguments, 0);
          var out = {
            uid: data.uid,
            mode: 'response',
            err: args[0],
            result: args[1]
          }
          var endpoint = domTarget();
          console.log('Receiver - return result: ', JSON.stringify(out));
          endpoint.postMessage(out, '*');
        });
      }
    };
    console.log('Receiver - add [handlePostMessage] to ', source.location.pathname)
    source.addEventListener('message', handlePostMessage);

    /** listen for a message of the given type */
    this.on = function(messageType, callback){
      console.log('Receiver.on', messageType);
      if(handlers[messageType]){
        handlers[messageType] = null;
      }
      handlers[messageType] = callback;
    };
  }


  root.msgr = root.msgr || {};
  root.msgr.Receiver = Receiver;
  root.msgr.Dispatcher = Dispatcher;

})(this)