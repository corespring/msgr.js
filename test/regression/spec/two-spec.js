var assert = require('assert');

describe('two', function(){
  it('multiple-calls-get-multiple-results', function(done){
     browser 
      .url('http://localhost:5000/test/samples/two/root.html')
      .waitForText('#output', 1500)
      .getText('#output', function(err, html) {
        assert.equal(html,'child-0child-1child-2');
      }).call(done);
  });

});