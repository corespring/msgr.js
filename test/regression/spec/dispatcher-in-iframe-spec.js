var assert = require('assert');

describe('dispatcher in the child page', function(){

  var baseUrl = process.env.MSGR_BASE_URL || 'http://localhost:5000';

  it('dispatcher in the child page', function(done){
    browser
      .url(baseUrl + '/test/regression/samples/dispatcher-in-iframe/root.html')
      .pause(400)
      .frame("child")
      .waitForText('#output', 1000)
      .getText('#output', function(err, html) {
        assert.equal('pong', html);
      }).call(done);
  });

});
