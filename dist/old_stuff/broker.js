//msgr.js


(function(root){

  function Broker(source, target){

    var getUid = function(){
      return new Date().getTime() + '-' + Math.floor(Math.random() * 100);
    }

    var brokerUid = (parent === window ? 'root' : 'child');// ;; + '-' + getUid();

    /** handlers for a given message type */
    var handlers = {};

    var domTarget = function(){
      if(target === 'parent' && parent != window){
        return parent;
      } else if(target && target.contentWindow){
        return target.contentWindow;
      }
    }

    var handlePostMessage = function(event){

      console.log(brokerUid , 'handlePostMessage: ', event);
      var data = event.data;

      if(data.messageType && handlers[data.messageType]){
        console.log(brokerUid, 'call the handler for', data.messageType)
        handlers[data.messageType](data.data, function(err, result){

          var args = Array.prototype.slice.call(arguments, 0);
          var out = {
            uid: data.uid,
            mode: 'response',
            err: args[0],
            result: args[1]
          }
          var endpoint = domTarget();
          endpoint.postMessage(out, '*');
        });
      }
    };
    console.log(brokerUid, 'add [handlePostMessage] to ', source.location.pathname)
    source.addEventListener('message', handlePostMessage);

    window.messageHandlers = {};

    this.send = function(messageType, data, callback){
      var messageUid = getUid();

      console.log(brokerUid, 'send:', messageType, messageUid);

      var h = window.messageHandlers[messageUid] = function(event){
        var data = event.data;
        if(data.uid === messageUid, data.mode === 'response'){
        console.log(brokerUid, 'tmpEventHander', data.uid, 'remove event listener');
          source.removeEventListener('message', window.messageHandlers[messageUid], false);
          callback(data.err, data.result);
        }
      }
      console.log( brokerUid, 'adding event listener....', messageUid);
      source.addEventListener('message', h, false);

      var msg = { messageType: messageType, mode: 'request', uid: messageUid, data: name }
      target.contentWindow.postMessage(msg, '*');
    };

    /** listen for a message of the given type */
    this.on = function(messageType, callback){
      console.log('[Broker].on', messageType);
      if(handlers[messageType]){
        handlers[messageType] = null;
      }
      handlers[messageType] = callback;
    };
  }

  root.msgr = root.msgr || {};
  root.msgr.Broker = Broker;
})(this);
