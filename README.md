# How create a NFT by Truffle with OpenZeppelin on Ubuntu

## 1. Make a folder name server-nft
```shell
    npm install && npm install -g truffle
    mkdir server-nft && cd server-nft
```
## 2. Initialize by Truffle
```
    truffle init
```

## 3. Install OpenZeppelin
```
    npm install --save-dev @openzeppelin/contracts
```

## 4. vim contracts/ServerNft.sol
```   
    pragma solidity ^0.8;

    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
    import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
    import "@openzeppelin/contracts/utils/Context.sol";
    import "@openzeppelin/contracts/utils/Counters.sol";

    /**
    * @dev {ERC721} token, including:
    *
    *  - ability for holders to burn (destroy) their tokens
    *  - a minter role that allows for token minting (creation)
    *  - a pauser role that allows to stop all token transfers
    *  - token ID and URI autogeneration
    *
    * This contract uses {AccessControl} to lock permissioned functions using the
    * different roles - head to its documentation for details.
    *
    * The account that deploys the contract will be granted the minter and pauser
    * roles, as well as the default admin role, which will let it grant both minter
    * and pauser roles to other accounts.
    *
    * _Deprecated in favor of https://wizard.openzeppelin.com/[Contracts Wizard]._
    */
    contract ServerNft is
        Context,
        AccessControlEnumerable,
        ERC721Enumerable,
        ERC721Burnable,
        ERC721Pausable
    {
        using Counters for Counters.Counter;

        bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
        bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

        Counters.Counter private _tokenIdTracker;

        string private _baseTokenURI;

        /**
        * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE` and `PAUSER_ROLE` to the
        * account that deploys the contract.
        *
        * Token URIs will be autogenerated based on `baseURI` and their token IDs.
        * See {ERC721-tokenURI}.
        */
        constructor(
            string memory name,
            string memory symbol,
            string memory baseTokenURI
        ) ERC721(name, symbol) {
            _baseTokenURI = baseTokenURI;

            _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

            _setupRole(MINTER_ROLE, _msgSender());
            _setupRole(PAUSER_ROLE, _msgSender());
        }

        function _baseURI() internal view virtual override returns (string memory) {
            return _baseTokenURI;
        }

        /**
        * @dev Creates a new token for `to`. Its token ID will be automatically
        * assigned (and available on the emitted {IERC721-Transfer} event), and the token
        * URI autogenerated based on the base URI passed at construction.
        *
        * See {ERC721-_mint}.
        *
        * Requirements:
        *
        * - the caller must have the `MINTER_ROLE`.
        */
        function mint(address to) public virtual {
            require(hasRole(MINTER_ROLE, _msgSender()), "ERC721PresetMinterPauserAutoId: must have minter role to mint");

            // We cannot just use balanceOf to create the new tokenId because tokens
            // can be burned (destroyed), so we need a separate counter.
            _mint(to, _tokenIdTracker.current());
            _tokenIdTracker.increment();
        }

        /**
        * @dev Pauses all token transfers.
        *
        * See {ERC721Pausable} and {Pausable-_pause}.
        *
        * Requirements:
        *
        * - the caller must have the `PAUSER_ROLE`.
        */
        function pause() public virtual {
            require(hasRole(PAUSER_ROLE, _msgSender()), "ERC721PresetMinterPauserAutoId: must have pauser role to pause");
            _pause();
        }

        /**
        * @dev Unpauses all token transfers.
        *
        * See {ERC721Pausable} and {Pausable-_unpause}.
        *
        * Requirements:
        *
        * - the caller must have the `PAUSER_ROLE`.
        */
        function unpause() public virtual {
            require(hasRole(PAUSER_ROLE, _msgSender()), "ERC721PresetMinterPauserAutoId: must have pauser role to unpause");
            _unpause();
        }

        function _beforeTokenTransfer(
            address from,
            address to,
            uint256 tokenId
        ) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
            super._beforeTokenTransfer(from, to, tokenId);
        }

        /**
        * @dev See {IERC165-supportsInterface}.
        */
        function supportsInterface(bytes4 interfaceId)
            public
            view
            virtual
            override(AccessControlEnumerable, ERC721, ERC721Enumerable)
            returns (bool)
        {
            return super.supportsInterface(interfaceId);
        }
    }

```

## 5. vim migrations/2_deploy.js
```
    // migrations/2_deploy.js
    // SPDX-License-Identifier: MIT
    const ServerNft = artifacts.require("ServerNft");

    module.exports = function(deployer) {
    deployer.deploy(ServerNft, "Server NFT","NFT", "https://my-json-server.typicode.com/abcoathup/samplenft/tokens/");
    };
```

## 6. Compiling and migrating
```
    truffle develop  
    migrate
```

## 7. We can then use our deployed contract.
```
   nft = await ServerNft.deployed()
```

## 8. Interact with NFT
```
    truffle(develop)> await nft.name()
    'My NFT'
    truffle(develop)> await nft.symbol()
    'NFT'
    truffle(develop)> await nft.baseURI()

    await nft.mint(accounts[1], "Dell", "SN123456", "2022-06-20")
```

## 9. Deploy to Ganache
1.  vim truffle-config.js
```
    network : {
        ganache: {
            host: "127.0.0.1", 
            port: 8545,
            network_id: "*",
        }
    }    
```

2.  start Ganache cli
  ```
    npm install -g ganache-cli
    ganache-cli
  ```
3.  connect Truffle to Ganache
```
    truffle consle --network ganache
    migrate
    nft = await ServerNft.deployed()
```

## 10 Deply with HDWallet
```
    npx mnemonics > .secret
    npm install --save-dev @truffle/hdwallet-provider

```
edit tuffle-config.js
```
    const HDWalletProvider = require('@truffle/hdwallet-provider');
    const fs = require('fs');
    const mnemonic = fs.readFileSync(".secret").toString().trim();

    network : {
        secret: {
            provider: () => new HDWalletProvider(mnemonic, "http://127.0.0.1:8545", 0, 10),
            host: "127.0.0.1",      // 
            port: 8545,
            network_id: "*",        // 
        }
    }
    
    // send ETH to address 0x0FaB6774f54AD55ed82a000ffa19b688318E1250
    web3.eth.sendTransaction({from:accounts[0], to:"0x0FaB6774f54AD55ed82a000ffa19b688318E1250", value:100 * 1000000000000000000})
    
    //
    web3.eth.getBalance(accounts[0])
```