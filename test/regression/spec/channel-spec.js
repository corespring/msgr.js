var assert = require('assert');

describe('dispatcher in the child page', function(){

  var baseUrl = process.env.MSGR_BASE_URL || 'http://localhost:5000';

  console.log('browser: ', browser);

  it('dispatcher in the child page', function(done){
    browser
      .url(baseUrl + '/test/regression/samples/channel/root.html')
      .pause(400)
      .waitForText('#output', 1000)
      .getText('#output', function(err, html){
        assert.equal('hi root, i\'m an iframe', html);
      })
      .frame("child")
      .waitForText('#output', 1000)
      .getText('#output', function(err, html) {
        assert.equal('hi iframe, i\'m root', html);
      })
      .call(done);
  });

});