var assert = require('assert');

describe('multiple-channels', function(){

  var baseUrl = process.env.MSGR_BASE_URL || 'http://localhost:5000';
  it('multiple-channels', function(done){
    browser
      .url(baseUrl + '/test/regression/samples/multiple-instances/root.html')
      .click('#add-1')
      .pause(400)
      .click('#add-2')
      .pause(400)
      .waitForText('.output', 1000)
      .getText('.output', function(err, html) {

        var expected = [
        'channelOne - name: child-0',
        'channelOne - hi-from-child-one',
        'channelTwo - name: child-0',
        'channelTwo - hi-from-child-two'
        ].join('\n');
        assert.equal(expected, html);
      }).call(done);
  });

});