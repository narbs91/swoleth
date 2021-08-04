var Swoleth = artifacts.require("./Swoleth.sol");

contract('Swoleth', accounts => {

    it("passes", () =>
    Swoleth.deployed()
      .then(() => {
        assert.equal(
          true,
          true,
          "Tiss false"
        );
      }));


})