"use server"

import { algoliasearch } from 'algoliasearch'; // Correct import for v5

import { toEther } from "thirdweb";
import { Contract } from '../utils/Contract';
import { fetchNFT, listings} from "../contracts/listingInfo"
import { tokenInfo } from '../hooks/useCurrency';
import { ipfsToHttp } from '../utils/ipfsToHttp';
// Initialize Algolia client
 const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
);

const indexName = "nft_listings"; // Define the index name


const serializeBigInt = (value: bigint | number): string => {
  return value?.toString() || "0";
};






const processNFTData = async (listing: any) => {
  try {
    const contract = Contract(listing.assetContract);
    const nftDetails = await fetchNFT(
      contract,
      listing.tokenType,
      listing.tokenId
    );

    const currency =  tokenInfo(listing.currency);
    if (!currency) {
      console.warn(`Currency info not found for address: ${listing.currency}`);
    }
  
    const image = ipfsToHttp(nftDetails?.metadata?.image!);
    
    
    return {
      objectID: serializeBigInt(listing.listingId),
      listingId: serializeBigInt(listing.listingId),
      tokenId: serializeBigInt(listing.tokenId),
      price: toEther(listing.pricePerToken),
      startTimestamp: serializeBigInt(listing.startTimestamp),
      endTimestamp: serializeBigInt(listing.endTimestamp),
      listingCreator: listing.listingCreator,
      assetContract: listing.assetContract,
      currency: listing.currency,
      tokenType: listing.tokenType,
      listingType: listing.listingType,
      status: listing.status,
      reserved: listing.reserved,
      currencySymbol: currency?.symbol?.toString() || "ETH",
      nftName: nftDetails?.metadata?.name || "Unnamed NFT",
      nftDescription: nftDetails?.metadata?.description || "No description",
      nftImage: image,
      searchable: [
        nftDetails?.metadata?.name,
        currency?.symbol?.toString() || "ETH",
        `status-${listing?.status?.toString()}`,
      ].filter(Boolean),
    };
  } catch (error) {
    console.error(`Failed to process listing ID: ${listing.listingId}`, error);
    return null;
  }
};



export async function updateAlgoliaIndex() {
  try {
    // Get all listings
    const allListings = await listings();
    if (!allListings?.length) {
      console.warn("No listings found");
      return;
    }

    // Process listings in batches to avoid overwhelming the network
    const BATCH_SIZE = 8;
    const results = [];
    
    for (let i = 0; i < allListings.length; i += BATCH_SIZE) {
      const batch = allListings.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(processNFTData)
      );
      
      results.push(...batchResults);
      
     
    }

    // Filter out failed records and nulls
    const records = results
      .filter((result): result is PromiseFulfilledResult<any> => 
        result.status === "fulfilled" && result.value !== null
      )
      .map(result => result.value);

    if (records.length === 0) {
      console.warn("No valid records to index");
      return;
    }
    // Update index settings
      await algoliaClient.setSettings({
        indexName,
        indexSettings: {
      searchableAttributes: [
        'nftName',
        'nftDescription',
        'tokenId',
        'currencySymbol',
        'price',
        'listingCreator',
        'assetContract'
      ],
      attributesForFaceting: [
        'status',
        'currencySymbol'
      ]
    }
    });
    // Save objects to the index

    const ALGOLIA_BATCH_SIZE = 100;
    for (let i = 0; i < records.length; i += ALGOLIA_BATCH_SIZE) {
      const batch = records.slice(i, i + ALGOLIA_BATCH_SIZE);
   const response = await algoliaClient.saveObjects({indexName, objects: batch})

    // Wait for the task to complete
 for (const task of response) {
      await algoliaClient.waitForTask({indexName, taskID: task.taskID});
    }
    console.log(`Indexed ${records.length} NFT listings`);
  }
  } catch (error) {
    console.error('Algolia Indexing Error:', error);
  }
}
