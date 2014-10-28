(function(root) {

  /**
   * This lib supports ie8
   * Because if this the following cruft has been added: 
   * - JSON.stringify/parse of all data
   * - Attacher to allow browser safe listener attachment.
   * - JSON check
   * - Function.bind shiim
   */
  if(!JSON){
    throw "JSON is undefined, if you are using ie8 be sure to define a doctype eg: <!DOCTYPE html>"; 
  }

  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs   = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP    = function() {},
          fBound  = function() {
            return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  function Logger(name, options) {

    var handle = function(level){
      return function(){
        if (options && options[level]) {
          options[level].bind(null, name).apply(null, arguments);
        } else {
          if (window.console && window.console[level] ) {
            var args = Array.prototype.slice.call(arguments); // Make real array from arguments
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
    };

    this.debug = handle('debug');
    this.log = handle('log');
    this.warn = handle('warn');
    this.info = handle('info');
  }

  function Attacher(win){

    this.addMessageListener = function(callback) {
      win[addEventFunctionName()](eventName(), callback);
    };

    var eventName = function () {
      return win.addEventListener ? "message" : "onmessage";
    };

    var addEventFunctionName = function () {
      return win.addEventListener ? "addEventListener" : "attachEvent";
    };
  }

  function Dispatcher(source, target, options) {
    var logger = new Logger('msgr.Dispatcher', options);
    var attacher = new Attacher(source);
    /** queue of pending messages that need to be send once the receiver is ready */
    var pendingMessages = [];

    logger.debug('new instance');

    var receiverReady = false;

    var getUid = function() {
      return new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
    };

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

      alert('ie: handle-post-messaage', event.source);
      logger.log('handlePostMessage', event.data);

      if(event.source !== target.contentWindow){
        logger.warn('not the source - ignore');
        return;
      }
      
      var data;
      
      try{
        data = JSON.parse(event.data);
      } catch (e) {
        logger.warn('error parsing event data');
        data = {};
      }

      if(data.mode == 'receiver-ready'){
        logger.debug('receiver is ready - flush the queue...');
        receiverReady = true;
        flushPendingMessages.bind(this)();
      }

      if (callbacks[data.uid]) {
        callbacks[data.uid](data.err, data.result);
        callbacks[data.uid] = null;
      }
    };
    
    attacher.addMessageListener(handlePostMessage.bind(this));

    this.send = function(messageType, data, callback) {
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
          uid: messageUid,
          data: name
        };
        target.contentWindow.postMessage(JSON.stringify(msg), '*');
      } else {
        pendingMessages.push({messageType: messageType, data: data, callback: callback});
      }
    };
  }

  function Receiver(source, target, options) {

    var logger = new Logger('msgr.Receiver', options);
    var attacher = new Attacher(source);

    logger.debug('new instance');

    if(source === target){
      logger.warn('the source and target are the same - nothing to listen to');
      return;
    }

    //We expect that there is a root Dispatcher waiting for this receiver to 
    //be ready - inform it that we are now ready to take messages
    alert('send receiver-ready');
    setTimeout(function(){
      target.postMessage(JSON.stringify({
        mode: 'receiver-ready'
      }), '*');

    }, 200);

    var handlers = {};

    var handlePostMessage = function(event) {

      logger.log('handlePostMessage: ', JSON.stringify(event.data));
      var data;
      
      try{
        data = JSON.parse(event.data);
      } catch (e){
        data = {};
      }

      if (data.messageType && handlers[data.messageType]) {
        logger.log('call the handler for', data.messageType);
        handlers[data.messageType](data.data, function(err, result) {

          var args = Array.prototype.slice.call(arguments, 0);
          var out = {
            uid: data.uid,
            mode: 'response',
            err: args[0],
            result: args[1]
          };
          var endpoint = target;
          logger.log('Receiver - return result: ', JSON.stringify(out));
          endpoint.postMessage(JSON.stringify(out), '*');
        });
      }
    };
    logger.log('add [handlePostMessage] to ', source.location.pathname);

    attacher.addMessageListener(handlePostMessage);

    /** listen for a message of the given type */
    this.on = function(messageType, callback) {
      logger.log('.on - add handler for', messageType);
      if (handlers[messageType]) {
        handlers[messageType] = null;
      }
      handlers[messageType] = callback;
    };
  }


  root.msgr = root.msgr || {};
  root.msgr.Receiver = Receiver;
  root.msgr.Dispatcher = Dispatcher;

})(this);