(function(root){

  function Logger(name, options){
    this.log = function(){
      if(options && options.log){
        options.log.bind(null, name).apply(null, arguments);
      } else {
        if(console && console.log){
          console.log.bind(console, name).apply(console, arguments);
        }
      }
    };
  }

  function Dispatcher(source, target, options){

    var getUid = function(){
      return new Date().getTime() + '-' + Math.floor(Math.random() * 100);
    };

    var logger = new Logger('msgr.Dispatcher', options);

    var brokerUid = 'Dispatcher';

    var callbacks = {};

      /**
       Handle all messages to the source window
       */
    var handlePostMessage = function(event){
      logger.log('handlePostMessage', event.data);

      if(callbacks[event.data.uid]){
        callbacks[event.data.uid](event.data.err, event.data.result);
        callbacks[event.data.uid] = null;
      }
    };

    source.addEventListener('message', handlePostMessage);

    this.send = function(messageType, data, callback){
      var messageUid = getUid();
      logger.log('send:', messageType, messageUid);
      if(callbacks[messageUid]){
        throw 'uid already exists: ' + messageUid;
      }
      callbacks[messageUid] = callback;
      
      var msg = { 
        messageType: messageType, 
        mode: 'request', 
        uid: messageUid, 
        data: name 
      };
      target.contentWindow.postMessage(msg, '*');
    };
  }

  function Receiver(source, target, options){

    var logger = new Logger('msgr.Receiver', options);

    var domTarget = function(){
      if(target === 'parent' && parent != window){
        return parent;
      } else if(target && target.contentWindow){
        return target.contentWindow;
      }
    };

    var handlers = {};

    var handlePostMessage = function(event){

      logger.log('handlePostMessage: ', JSON.stringify(event.data));
      var data = event.data;

      if(data.messageType && handlers[data.messageType]){
        logger.log('call the handler for', data.messageType);
        handlers[data.messageType](data.data, function(err, result){

          var args = Array.prototype.slice.call(arguments, 0);
          var out = {
            uid: data.uid,
            mode: 'response',
            err: args[0],
            result: args[1]
          };
          var endpoint = domTarget();
          logger.log('Receiver - return result: ', JSON.stringify(out));
          endpoint.postMessage(out, '*');
        });
      }
    };
    logger.log('add [handlePostMessage] to ', source.location.pathname);
    source.addEventListener('message', handlePostMessage);

    /** listen for a message of the given type */
    this.on = function(messageType, callback){
      logger.log('.on - add handler for', messageType);
      if(handlers[messageType]){
        handlers[messageType] = null;
      }
      handlers[messageType] = callback;
    };
  }


  root.msgr = root.msgr || {};
  root.msgr.Receiver = Receiver;
  root.msgr.Dispatcher = Dispatcher;

})(this);
