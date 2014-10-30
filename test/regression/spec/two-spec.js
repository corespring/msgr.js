var assert = require('assert');

describe('two', function(){

  var baseUrl = process.env.MSGR_BASE_URL || 'http://localhost:5000';
  it('multiple-calls-get-multiple-results', function(done){
     browser 
      .url( baseUrl + '/test/regression/samples/two/root.html')
      .waitForText('#output', 1500)
      .getText('#output', function(err, html) {
        assert.equal(html,'child-0child-1child-2');
      }).call(done);
  });

});