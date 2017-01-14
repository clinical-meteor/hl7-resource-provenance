describe('clinical:hl7-resources-provenances', function () {
  var server = meteor();
  var client = browser(server);

  it('Provenances should exist on the client', function () {
    return client.execute(function () {
      expect(Provenances).to.exist;
    });
  });

  it('Provenances should exist on the server', function () {
    return server.execute(function () {
      expect(Provenances).to.exist;
    });
  });

});
