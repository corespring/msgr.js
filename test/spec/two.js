var assert = require('assert');


describe('two', function(){
  it('works', function(done){
    browser
      .url('http://localhost:5000/test/two/root.html')
      .waitForText('#output', 500)
      .getText('#output', function(err, html) {
        assert.equal(html,'child-0child-1child-2');
      }).end(done);
  }); 
});