(function(root) {

  function validateSourceAndTarget(name, source,target){
    if(!source.postMessage) {
      throw name + ' - source doesn\'t have postMessage';
    }

    if(!target.postMessage) {
      throw name + ' - source doesn\'t have postMessage';
    }
  }

  /**
   * This lib supports ie8
   * Because if this the following cruft has been added:
   * - JSON.stringify/parse of all data
   * - MessageListener to allow browser safe listener attachment.
   * - JSON check
   * - Function.bind shim
   * - setTimeout on 'receiver-ready'
   * - log handling
   */
  if(!JSON){
    throw "JSON is undefined, if you are using ie8 be sure to define a doctype eg: <!DOCTYPE html>";
  }

  function parseJson(json, logger) {
    try {
      return JSON.parse(json);
    } catch (e) {
      if (logger) {
        logger.warn('error parsing event data');
      }
      return {};
    }
  }

  function argsToArray(args, startPos) {
    return Array.prototype.slice.call(args, startPos || 0);
  }

  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs   = argsToArray(arguments, 1),
          fToBind = this,
          fNOP    = function() {},
          fBound  = function() {
            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(argsToArray(arguments)));
          };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  function Logger(name, options) {

    var handle = function(level){

      var logHandler = function(){
        if (options && options.logger && options.logger[level]) {
          options.logger[level].bind(null, name).apply(null, arguments);
        } else {
          if (window.console && window.console[level] ) {
            var args = argsToArray(arguments); // Make real array from arguments
            args.unshift(name);
            var fn = window.console[level];
            if(fn.apply){
              fn.apply(window.console, args);
            } else {
              alert(args.join(', '));
            }
          }
        }
      };

      if(options && (options.enableLogging || options.logger) ){
        return logHandler;
      } else {
        return function(){};
      }
    };

    this.debug = handle('debug');
    this.log = handle('log');
    this.warn = handle('warn');
    this.info = handle('info');
  }

  function MessageListener(win){

    var currentHandler = null;

    this.add = function(callback) {
      if(currentHandler) {
        this.remove();
      }
      win[addEventFunctionName()](eventName(), callback);
      currentHandler = callback;
    };

    this.remove = function(){
      win[removeEventFunctionName()](eventName(), currentHandler, false);
    };

    var removeEventFunctionName = function(){
      return win.removeEventListener ? 'removeEventListener' : 'detachEvent';
    };

    var eventName = function () {
      return win.addEventListener ? 'message' : 'onmessage';
    };

    var addEventFunctionName = function () {
      return win.addEventListener ? 'addEventListener' : 'attachEvent';
    };
  }

  function Dispatcher(source, target, options) {
    var getUid = function() {
      return new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
    };

    validateSourceAndTarget('msgr.Dispatcher', source, target);

    var logger = new Logger( getUid() + ' - msgr.Dispatcher', options);
    var messageListener = new MessageListener(source);
    /** queue of pending messages that need to be send once the receiver is ready */
    var pendingMessages = [];

    logger.debug('new instance');

    /** Will be set to true, if receiver-ready is received **/
    var receiverReady = false;

    logger.debug('receiver ready: ', receiverReady);
    logger.debug('source: ', source);
    logger.debug('target: ', target);

    var flushPendingMessages = function(){
      for(var i = 0; i < pendingMessages.length; i++){
        var pm = pendingMessages[i];
        this.send(pm.messageType, pm.data, pm.callback);
      }
      pendingMessages = [];
    };

    var callbacks = {};

    /**
    Handle all messages to the source window
    */
    var handlePostMessage = function(event) {

      logger.log('handlePostMessage', event.data);

      if(event.source !== target){
        logger.warn('not the source - ignore');
        return;
      }

      var data = parseJson(event.data, logger);

      //Note that data.mode is used, so we don't need a listener
      if(data.mode === 'receiver-ready'){
        if(receiverReady){
          logger.debug('receiver ready already');
        } else {
          logger.debug('receiver is ready - flush the queue...');
          receiverReady = true;

          //Note that data.mode is used, so we don't need a listener
          target.postMessage(JSON.stringify({mode:'sender-ready'}), '*');
          flushPendingMessages.bind(this)();
        }
      }

      if (callbacks[data.uid]) {
        callbacks[data.uid](data.err, data.result);
        callbacks[data.uid] = null;
      } else {
        logger.warn('no callback set for: ', data.uid);
      }
    };

    messageListener.add(handlePostMessage.bind(this));

    /**
     * Send a message to the target.
     * @param name - the name of the message
     * @param data (optional) - a serializeable object to send with the message
     * @param callback (optional) - a callback function of the form:
     *     function(err, result){
     *        //...
     *     }
     * Note: if you don't have any data to send you can supply the callback
     * as the 2nd argument.
     */
    this.send = function() {

      var args = argsToArray(arguments, 0);
      var messageType = args[0];
      var data, callback;
      if(typeof(args[1]) === 'function'){
        data = null;
        callback = args[1];
      } else {
        data = args[1];
        callback = args[2];
      }

      if(receiverReady){
        var messageUid = getUid();
        logger.log('send:', messageType, messageUid);
        if (callbacks[messageUid]) {
          throw 'uid already exists: ' + messageUid;
        }
        callbacks[messageUid] = callback;

        var msg = {
          messageType: messageType,
          mode: 'request',
          uid: messageUid
        };

        if(data){
          msg.data = data;
        }
        target.postMessage(JSON.stringify(msg), '*');
      } else {
        logger.debug('receiver not ready yet, add to pendingMessages');

        pendingMessages.push({messageType: messageType, data: data, callback: callback});
      }
    };

    /**
     * Remove the dispatcher - it'll stop listening for messages on the source window.
     */
    this.remove = function(){
      messageListener.remove();
    };

    //when the receiver receives this message
    //it can stop polling
    this.send("sender-ready");
  }

  function Receiver(source, target, options) {

    var logger = new Logger('msgr.Receiver', options);
    var messageListener = new MessageListener(source);

    validateSourceAndTarget('msgr.Receiver', source, target);

    logger.debug('new instance');

    if(source === target){
      logger.warn('the source and target are the same - nothing to listen to');
      this.on = function(){
        throw 'source === target - using a no-op function';
      };
      return;
    }

    var handlers = {};
    var senderReady = false;

    var handlePostMessage = function(event) {

      logger.log('handlePostMessage: ', JSON.stringify(event.data));

      var data = parseJson(event.data, logger);
      logger.log('data:', data);

      function handleDone(err, result) {
        var args = argsToArray(arguments, 0);
        var out = {
          messageType: data.messageType,
          uid: data.uid,
          mode: 'response',
          err: err,
          result: result
        };
        var endpoint = target;
        logger.log('Receiver - return result: ', JSON.stringify(out));
        endpoint.postMessage(JSON.stringify(out), '*');
      }

      if(data.mode === 'sender-ready'){
        if(senderReady){
          logger.debug("sender ready already");
        } else {
          logger.debug("sender is ready.");
          senderReady = true;
        }
      }

      logger.log('data message type: ', data.messageType);
      if(data.messageType) {
        if(handlers.allMessageTypes && !handlers[data.messageType]){
          logger.log('using the * handler for', data.messageType);
          handlers.allMessageTypes(data.messageType, data.data, handleDone);
        } else {
          if (handlers[data.messageType]) {
            for(var i = 0; i < handlers[data.messageType].length; i++){
              logger.log('call the handler for', data.messageType);
              handlers[data.messageType][i](data.data, handleDone);
            }
          }
        }
      }

    };
    logger.log('add [handlePostMessage] to ', source.location.pathname);

    messageListener.add(handlePostMessage.bind(this));

    /**
    * listen for a message of the given type
    * You can listen for specific types with a callback like:
    *     function(data, done) {}
    *
    * Or you can listen for all types using * - the callback must be:
    *     function(eventName, data, done)
    *
    * If you add both a specific and a * - the specific callback will be called still
    */
    this.on = function(messageType, callback) {
      if(messageType === '*'){
        handlers.allMessageTypes = callback;
      } else {
        handlers[messageType] = handlers[messageType] || [];
        handlers[messageType].push(callback);
        logger.log('.on - add handler for', messageType, 'no of handlers:', handlers[messageType].length);
      }
    };

    this.remove = function(){
      messageListener.remove();
    };

    //We expect that there is a root Dispatcher waiting for this receiver to
    //be ready - inform it that we are now ready to take messages
    (function() {
      function sendReceiverReady() {
        logger.log("sendReceiverReady", senderReady);
        if (!senderReady) {
          logger.log("posting receiver-ready");

          //Note that data.mode is used, so we don't need a listener
          target.postMessage(JSON.stringify({
            mode: 'receiver-ready'
          }), '*');

          //start timeout in case the sender is not ready yet
          setTimeout(sendReceiverReady, 300);
        }
      }

      sendReceiverReady();
    })();
  }

  function Channel(source,target, options){
    var dispatcher = new Dispatcher(source, target, options);
    var receiver = new Receiver(source, target, options);

    this.send = function(){
      dispatcher.send.apply(dispatcher, argsToArray(arguments,0));
    };

    this.on = function(){
      receiver.on.apply(receiver, argsToArray(arguments,0));
    };

    this.remove = function(){
      dispatcher.remove();
      receiver.remove();
    };
  }

  root.msgr = root.msgr || {};
  root.msgr.Receiver = Receiver;
  root.msgr.Dispatcher = Dispatcher;
  root.msgr.Channel = Channel;

})(this);
