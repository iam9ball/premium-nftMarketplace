# Premium NFT Marketplace

Premium is a state-of-the-art NFT marketplace built with upgradeable smart contracts following the modular contract pattern. It supports both ERC721 and ERC1155 tokens, implements royalty standards, and offers multiple ways to trade NFTs including direct listings, offers, and auctions.

## Features

- **Upgradeable Smart Contracts**: Built using modular contract pattern for future extensibility
- **Multiple Token Standards**: Support for both ERC721 and ERC1155 NFTs
- **Trading Methods**:
  - Direct Listings: Create and manage direct sale listings
  - Offers: Place and accept offers on NFTs
  - Auctions: Host timed auctions with bidding functionality
- **NFT Creation**: Mint new NFTs directly on the platform
- **Royalty Support**: Implements standard royalty patterns for creators
- **Real-time Price Feeds**: Integration with Chainlink for accurate pricing
- **Fast Search**: Powered by Algolia for quick NFT discovery
- **Data Indexing**: The Graph integration for efficient data querying

## Tech Stack

### Blockchain & Smart Contracts
![Ethereum]
- **Foundry**: Smart contract development framework
- **Chainlink**: Oracle network for price feeds
- **OpenZeppelin**: Smart contract security standards

### Frontend
![Next.js]
- **Next.js**: React framework for production
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development
- **Viem**: Ethereum interaction library
- **ThirdWeb**: Web3 development framework

### Backend & Services
![The Graph]
- **The Graph**: Blockchain data indexing
- **Algolia**: Search functionality
- **IPFS**: Decentralized storage

## Prerequisites

- Node.js 18+
- Foundry
- MetaMask or compatible Web3 wallet

## Installation

1. Clone the repository:
```bash
git clone https://github.com/iam9ball/premium-nftMarketplace.git
cd NFTMARKETPLACE_APP/premium
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

## Smart Contract Architecture

The marketplace implements a modular, upgradeable pattern with the following extensions:

- **DirectListingExtension**: Handles direct sale listings
- **OfferExtension**: Manages offer functionality
- **AuctionExtension**: Controls auction mechanics
- **NFTCreatorExtension**: Handles NFT minting



## Acknowledgments

- Foundry Team
- OpenZeppelin
- Chainlink
- The Graph
- Algolia
- ThirdWeb