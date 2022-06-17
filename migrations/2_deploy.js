// migrations/2_deploy.js
// SPDX-License-Identifier: MIT
const ServerNft = artifacts.require("ServerNft");

module.exports = function(deployer) {
  deployer.deploy(ServerNft, "Server NFT","NFT", "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/");
};