import { readContract } from 'thirdweb';
import { ListingType } from './listing';
import { marketContract } from '../constant';
import {RoyaltyERC721, RoyaltyERC1155} from "thirdweb/modules"




export const listingTypeInfo = async (params: ListingType) => {
  try {
    const data = await readContract({
      contract: marketContract,
      method: "getListingTypeInfo",
      params: [params]     
    });

    if (!data) {
      console.log("No data returned");
     
    }

    return data;
  } catch (error) {
   
    throw error
    // Handle the error appropriately
   
  }
}


export const listingFee = async (currency: string, price:bigint) => {
  try {
    const  data  = await readContract({
  contract: marketContract,
  method:"getPlatformFee",
   params: [currency, price]     
})
   return data;
  } 
  catch (error) {
   throw error;
    // Handle the error appropriately
   
 }
}





export const listings = async () => {

  try {
     const data = await readContract({
     contract: marketContract,
     method:"getAllListings",
      params: []
  });
  // console.log("data")
  // console.log(data.length)

  if (!data) {
     return []
    }
  return data;
  
  } catch (error) {
    
     
     throw error;
    
  }
  
    
}


export const getListing = async (listingId: bigint) => {
  try {
      const data = await readContract({
     contract: marketContract,
     method:"getListing",
      params: [listingId]
    })

   return data;  
  }
  catch (error) {
   
    throw error;
    
  }
    
}
export const getAllValidListings = async () => {
  try {
      const data = await readContract({
     contract: marketContract,
     method:"getAllValidListings",
    })

   return data;  
  }
  catch (error) {
    
    throw error;
    
  }
    
}
export const getPlatformFee = async (currency: string, price: bigint) => {
  try {
      const data = await readContract({
     contract: marketContract,
     method:"getPlatformFee",
     params:[currency, price]
    })

   return data;  
  }
  catch (error) {
   
    throw error;
    
  }
    
}
export const getListingType = async (params: number) => {
  try {
      const data = await readContract({
     contract: marketContract,
     method:"getListingTypeInfo",
     params:[params]
    })

   return data;  
  }
  catch (error) {
    
    throw error;
    
    
  }
    
}
export const getApprovedBuyer = async (listingId: bigint) => {
  try {
      const data = await readContract({
     contract: marketContract,
     method:"getApprovedBuyer",
     params:[listingId]
    })

   return data;  
  }
  catch (error) {
   
    throw error;
    
  }
    
}

export const fetchNFT = async (contract: any, tokenType: number, tokenId:bigint) => {
  try {
    if (tokenType == 0) {

       const nft = await (await (import ("thirdweb/extensions/erc721"))).getNFT({
           contract,
            tokenId
        })
        const [ , result] = await RoyaltyERC721.getRoyaltyInfoForToken({contract, tokenId})
        return {...nft, result};
      } else if (tokenType == 1) {
       const nft = await (await (import ("thirdweb/extensions/erc1155"))).getNFT({
           contract,
            tokenId
        })
         const [, result] = await RoyaltyERC1155.getRoyaltyInfoForToken({contract, tokenId})
        return {...nft, result};
      } 
  } catch (error) {
   
    throw error;
   
  }
    }





