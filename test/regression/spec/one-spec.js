//one-spec.js
var assert = require('assert');

describe('one', function(){

  var baseUrl = process.env.MSGR_BASE_URL || 'http://localhost:5000';
  it('data is passed on to receiver', function(done){
     browser 
      .url( baseUrl + '/test/regression/samples/one/root.html')
      .waitForText('#output', 1500)
      .getText('#output', function(err, html) {
        assert.equal(html,'hello ed, hello evan, hello ervin');
      }).call(done);
  });

});