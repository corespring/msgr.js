var assert = require('assert');


describe('add-remove-add', function(){

  it('add-then-remove-then-add', function(done){
    browser
      .url('http://localhost:5000/test/samples/add-remove-add/root.html')
      .click('#add-1')
      .pause(400)
      .click('#add-2')
      .waitForText('#log-output', 1000)
      .getText('#log-output', function(err, html) {
        var receiverReadyCount = html.match(/msgr.Dispatcher handlePostMessage {"mode":"receiver-ready"}/g) || [];
        assert.equal(receiverReadyCount.length, 2);
      }).call(done);
  });

});