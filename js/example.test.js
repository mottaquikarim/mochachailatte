describe('Selectors', function() {
  describe('cards selector', function() {
    it('should return all HTML tags with .card', function() {
      chai.assert.equal(1, cards.length);
    });
  });
});
