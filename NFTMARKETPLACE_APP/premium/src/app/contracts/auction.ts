import {
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { contractAddress, marketContract } from "../constant";
import { Account } from "thirdweb/wallets";
import { approve, isERC721 } from "thirdweb/extensions/erc721";
import { isERC1155, setApprovalForAll } from "thirdweb/extensions/erc1155";
import { Contract } from "../utils/Contract";
import { toWei } from "thirdweb";
import { getAuction } from "./auctionInfo";
import { NATIVE_TOKEN } from "../utils/address";


// export const createAuction = async (
//   assetContract: string,
//   tokenId: bigint,
//   currency: string,
//   minimumBidAmount: string,
//   buyoutBidAmount: string,
//   bidBufferBps: bigint,
//   startTimestamp: bigint,
//   endTimestamp: bigint,
//   account: Account
// ) => {
//   try {
   
//   const tokenContract = Contract(assetContract)
//     const erc721 = await isERC721({
//       contract: tokenContract,
//     });

//     const erc1155 = await isERC1155({
//       contract: tokenContract,
//     });

    
//     let approveTransaction;
//     if (erc721) {
//       approveTransaction = approve({
//         contract: tokenContract,
//         to: contractAddress,
//         tokenId,
//       });
//     } else if (erc1155) {
//       approveTransaction = setApprovalForAll({
//         contract: tokenContract,
//         operator: contractAddress,
//         approved: true,
//       });
//     }
   

//     const transactionReceipt = await sendAndConfirmTransaction({
//       transaction: approveTransaction!,
//       account,
//     });
//     const minimumBidAmountInWei = toWei(minimumBidAmount);
//     const buyoutBidAmountInWei = toWei(buyoutBidAmount);
//     console.log("transactionReceipt", transactionReceipt.logs);
//     if (transactionReceipt.status === "success") {
//       const transaction = prepareContractCall({
//         contract: marketContract,
//         method: "createAuction",
//         params: [
//           {
//             assetContract,
//             tokenId,
//             currency,
//             minimumBidAmount: minimumBidAmountInWei,
//             buyoutBidAmount: buyoutBidAmountInWei,
//             bidBufferBps,
//             startTimestamp,
//             endTimestamp,
//           },
//         ],
//       });

//       const auctionReceipt = await sendAndConfirmTransaction({
//         account,
//         transaction,
//       });

//       if (auctionReceipt.status === "success") {
//         return {
//           success: true,
//           message: "Auction created successfully",
//         };
//       } else {
//         return {
//           success: false,
//           message: "Failed to create auction",
//         };
//       }
//     } else {
//       return {
//         success: false,
//         message: "Error approving market",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Auction_InvalidTime"):
//         message = "Error: Invalid Time";
//         break;
//       case error?.message.includes("__Auction_InvalidBuyoutBidAmount"):
//         message = "Your buyout bid cannot be less than minimum bid";
//         break;
//       case error?.message.includes("__Auction_InvalidBidBuffer"):
//         message = "Error: Max bid buffer is 100 bps";
//         break;
//       case error?.message.includes("__Auction_InvalidDuration"):
//         message = "Error: Max duration for auction is 90 minutes";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };

// export const cancelAuction = async (auctionId: bigint, account: Account) => {
//   try {
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "cancelAuction",
//       params: [auctionId],
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Auction cancelled",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error cancelling auction",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Auction_UnAuthorizedToCall"):
//         message = "Error: You cannot cancel this auction";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };

// export const updateAuction = async (
//   auctionId: bigint,
//   currency: string,
//   minimumBidAmount: bigint,
//   buyoutBidAmount: bigint,
//   bidBufferBps: bigint,
//   startTimestamp: bigint,
//   endTimestamp: bigint,
//   account: Account
// ) => {
//   try {
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "updateAuction",
//       params: [
//         auctionId,
//         {
//           currency,
//           minimumBidAmount,
//           buyoutBidAmount,
//           bidBufferBps,
//           startTimestamp,
//           endTimestamp,
//         },
//       ],
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Auction updated",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error updating auction",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Auction_UnAuthorizedToCall"):
//         message = "Error: You cannot update this auction";
//         break;
//       case error?.message.includes("__Auction_InvalidAuctionState") ||
//         error?.message.includes("__Auction_InvalidTime"):
//         message = "Error: Auction is no longer valid";
//         break;
//       case error?.message.includes("__Auction_InvalidBuyoutBidAmount"):
//         message = "Your buyout bid cannot be less than minimum bid";
//         break;
//       case error?.message.includes("__Auction_InvalidBidBuffer"):
//         message = "Error: Max bid buffer is 100 bps";
//         break;
//       case error?.message.includes("__Auction_InvalidDuration"):
//         message = "Error: Max duration for auction is 90 minutes";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };

// export const bidInAuction = async (
//   auctionId: bigint,
//   bidAmount: bigint,
//   account: Account
// ) => {
//   try {
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "bidInAuction",
//       params: [auctionId, bidAmount],
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Bid placed",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error placing bid",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Auction_InvalidBidTime"):
//         message = "Error: Auction is no longer valid";
//         break;
//       case error?.message.includes("__Auction_InvalidBidAmount"):
//         message = "Error placing bid: Try adjusting your bid";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };

// export const collectAuctionPayout = async (
//   auctionId: bigint,
//   account: Account
// ) => {
//   try {
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "collectAuctionPayout",
//       params: [auctionId],
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Auction payout transferred",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error collecting payout",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Auction_InvalidAuctionState"):
//         message = "Error: Auction is no longer valid";
//         break;
//       case error?.message.includes("__Auction_UnAuthorizedToCall"):
//         message = "You are not authorized to collect payout for this listing";
//         break;
//       case error?.message.includes("__Auction_NoBidYet"):
//         message = "Error: No bid placed";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };

// export const collectAuctionTokens = async (
//   auctionId: bigint,
//   account: Account
// ) => {
//   try {
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "collectAuctionTokens",
//       params: [auctionId],
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Auction tokens collected",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error collecting tokens",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Auction_InvalidAuctionState"):
//         message = "Error: Auction is no longer valid";
//         break;
//       case error?.message.includes("__Auction_UnAuthorizedToCall"):
//         message = "You are not authorized to collect tokens for this listing";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };









export const getErrorMessage = (error: any): string => {
  switch (true) {
    // Auction-specific errors
    case error?.message.includes("__Auction_InvalidTime"):
      return "Invalid auction timings.";
    case error?.message.includes("__Auction_InvalidBuyoutBidAmount"):
      return "Buyout bid must be ≥ minimum bid.";
    case error?.message.includes("__Auction_InvalidBidBuffer"):
      return "Bid buffer exceeds max limit (100 bps).";
    case error?.message.includes("__Auction_InvalidDuration"):
      return "Auction duration exceeds 90 minutes.";
    case error?.message.includes("__Auction_UnAuthorizedToCall"):
      return "You are not authorized.";
    case error?.message.includes("__Auction_InvalidAuctionState"):
      return "Auction is no longer valid.";
    case error?.message.includes("__Auction_NoBidYet"):
      return "No bids placed yet.";
    case error?.message.includes("__Auction_InvalidBidTime"):
      return "Bidding not allowed at this time.";
    case error?.message.includes("__Auction_InvalidBidAmount"):
      return "Bid amount is too low.";
    case error?.message.includes("__Auction_TransferFailed"):
      return "Funds transfer failed.";
    case error?.message.includes("__Auction_InvalidAssetContract"):
      return "Invalid asset contract.";
    case error?.message.includes("__Auction_InvalidAuctionCurrency"):
      return "Currency not approved for auction.";
    default:
      return "An unexpected error occurred. Please try again";
  }
};




export const createAuction = async (
  assetContract: string,
  tokenId: bigint,
  currency: string,
  minimumBidAmount: string,
  buyoutBidAmount: string,
  bidBufferBps: bigint,
  startTimestamp: bigint,
  endTimestamp: bigint,
  account: Account
) => {
  try {
    const tokenContract = Contract(assetContract);
    const erc721 = await isERC721({ contract: tokenContract });
    const erc1155 = await isERC1155({ contract: tokenContract });

    let approveTransaction;
    if (erc721) {
      approveTransaction = approve({
        contract: tokenContract,
        to: contractAddress,
        tokenId,
      });
    } else if (erc1155) {
      approveTransaction = setApprovalForAll({
        contract: tokenContract,
        operator: contractAddress,
        approved: true,
      });
    }

    const transactionReceipt = await sendAndConfirmTransaction({
      transaction: approveTransaction!,
      account,
    });

    const minimumBidAmountInWei = toWei(minimumBidAmount);
    const buyoutBidAmountInWei = toWei(buyoutBidAmount);

    if (transactionReceipt.status === "success") {
      const transaction = prepareContractCall({
        contract: marketContract,
        method: "createAuction",
        params: [
          {
            assetContract,
            tokenId,
            currency,
            minimumBidAmount: minimumBidAmountInWei,
            buyoutBidAmount: buyoutBidAmountInWei,
            bidBufferBps,
            startTimestamp,
            endTimestamp,
          },
        ],
      });

      const auctionReceipt = await sendAndConfirmTransaction({
        account,
        transaction,
      });

      if (auctionReceipt.status === "success") {
        return {
          success: true,
          message: "Auction created successfully",
        };
      } else {
        return {
          success: false,
          message: "Failed to create auction",
        };
      }
    } else {
      return {
        success: false,
        message: "Error approving market",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
   throw new Error(message, error);
  }
};


export const cancelAuction = async (auctionId: bigint, account: Account) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "cancelAuction",
      params: [auctionId],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Auction cancelled",
      };
    } else {
      return {
        success: false,
        message: "Error cancelling auction",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
   throw new Error(message, error);
  }
};


export const updateAuction = async (
  auctionId: bigint,
  currency: string,
  minimumBidAmount: bigint,
  buyoutBidAmount: bigint,
  bidBufferBps: bigint,
  startTimestamp: bigint,
  endTimestamp: bigint,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "updateAuction",
      params: [
        auctionId,
        {
          currency,
          minimumBidAmount,
          buyoutBidAmount,
          bidBufferBps,
          startTimestamp,
          endTimestamp,
        },
      ],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Auction updated",
      };
    } else {
      return {
        success: false,
        message: "Error updating auction",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
   throw new Error(message, error);
  }
};


export const bidInAuction = async (
  auctionId: bigint,
  bidAmount: string,
  account: Account
) => {
try {
  const amount = toWei(bidAmount);

  const auction = await getAuction(auctionId)
   let fee: bigint | undefined;
    if(auction.currency == NATIVE_TOKEN) {
      fee = amount
    } else {
      fee = undefined
    }

  const transaction = prepareContractCall({
    contract: marketContract,
    method: "bidInAuction",
    params: [auctionId, amount],
    value: fee
  });
 

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Bid placed",
      };
    } else {
      return {
        success: false,
        message: "Error placing bid",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
   throw new Error(message, error);
  }
};


export const collectAuctionPayout = async (
  auctionId: bigint,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "collectAuctionPayout",
      params: [auctionId],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Auction payout transferred",
      };
    } else {
      return {
        success: false,
        message: "Error collecting payout",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
   throw new Error(message, error);
  }
};




export const collectAuctionTokens = async (
  auctionId: bigint,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "collectAuctionTokens",
      params: [auctionId],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Auction tokens collected",
      };
    } else {
      return {
        success: false,
        message: "Error collecting tokens",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
   throw new Error(message, error);
  }
};











































































































































// import {
//   sendTransaction,
//   prepareContractCall,
//   sendAndConfirmTransaction
// } from "thirdweb";

// import { Account } from "thirdweb/wallets";
// import { contract, nftContract } from "./getContract";
// import { isERC1155, setApprovalForAll } from "thirdweb/extensions/erc1155";
// import { approve, isERC721 } from "thirdweb/extensions/erc721";
// import { contractAddress } from "../constant";

// export const createAuction = async (
//   assetContract: string,
//   tokenId: bigint,
//   currency: string,
//   minimumBidAmount: bigint,
//   buyoutBidAmount: bigint,
//   bidBufferBps: bigint,
//   startTimestamp: bigint,
//   endTimestamp: bigint,
//   account: Account
// ) => {
//   try {
//     const tokenContract = nftContract(assetContract)
    
//     const erc721 = await isERC721({
//       contract: tokenContract
//     })

//     const erc1155 = await isERC1155({
//       contract: tokenContract
//     })
    
//     let approveTransaction;
//     if(erc721) {
//       approveTransaction = approve({
//         contract: tokenContract,
//         to: contractAddress,
//         tokenId,
//       });
//     } else if(erc1155) {
//       approveTransaction = setApprovalForAll({
//         contract: tokenContract,
//         operator: contractAddress,
//         approved: true,
//       })
//     }

//     const transactionReceipt = await sendAndConfirmTransaction({ 
//       transaction: approveTransaction!, 
//       account 
//     });

//     if(transactionReceipt.status === "success") {
//       const transaction = prepareContractCall({
//         contract,
//         method: "createAuction",
//         params: [{
//           assetContract,
//           tokenId,
//           currency,
//           minimumBidAmount,
//           buyoutBidAmount,
//           bidBufferBps,
//           startTimestamp,
//           endTimestamp,
//         }],
//       });

//       const auctionReceipt = await sendAndConfirmTransaction({
//         account,
//         transaction,
//       });

//       if(auctionReceipt.status === "success") {
//         return {
//           success: true,
//           message: "Auction created successfully"
//         }
//       } else {
//         return {
//           success: false,
//           message: "Failed to create auction"
//         }
//       }
//     } else {
//       return {
//         success: false,
//         message: "Error approving market"
//       }
//     }

//   } catch (error: any) {
//     let message;
    
//     if (error?.message) {
//       switch (true) {
//         case error.message.includes('__AuctionLogic_InvalidTime'):
//           message = "Error: Invalid Time"
//           break;
//         case error.message.includes('__AuctionLogic_BuyoutBidMustBeGreater'):
//           message = "Your buyout bid cannot be less than minimum bid"
//           break;
//         case error.message.includes('__AuctionLogic_InvalidBidBuffer'):
//           message = "Error: Max bid buffer is 100 bps"
//           break;
//         case error.message.includes('__AuctionLogic_InvalidDuration'):
//           message = "Error: Max duration for auction is 90 minutes"
//           break;
//         default:
//           message = "An unexpected error occurred: Try again"
//       }
      
//       throw new Error(message, error);
//     }
//   }
// }

// export const cancelAuction = async (auctionId: bigint, account: Account) => {
//   const transaction = prepareContractCall({
//     contract,
//     method: "cancelAuction",
//     params: [auctionId],
//   });

//   try {
//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if(transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Auction cancelled successfully"
//       }
//     } else {
//       return {
//         success: false,
//         message: "Failed to cancel auction"
//       }
//     }
//   } catch (error: any) {
//     let message;
//     if (error?.message) {
//       switch (true) {
//         case error.message.includes('__AuctionLogic_UnauthorizedToCall'):
//           message = "Error: You cannot cancel this auction"
//           break
//         default:
//           message = "An unexpected error occurred: Try again"
//       }
//       throw new Error(message, error);
//     }
    
//   }
// }

// export const updateAuction = async (
//   auctionId: bigint,  
//   currency: string, 
//   minimumBidAmount: bigint, 
//   buyoutBidAmount: bigint,
//   bidBufferBps: bigint,
//   startTimestamp: bigint,
//   endTimestamp: bigint, 
//   account: Account
// ) => {
//   const transaction = prepareContractCall({
//     contract,
//     method: "updateAuction",
//     params: [auctionId, {
//       currency, 
//       minimumBidAmount, 
//       buyoutBidAmount,
//       bidBufferBps,
//       startTimestamp,
//       endTimestamp
//     }],
//   });

//   try {
//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if(transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Auction updated successfully"
//       }
//     } else {
//       return {
//         success: false,
//         message: "Failed to update auction"
//       }
//     }
//   } catch (error: any) {
//     let message;
//     if (error?.message) {
//       switch (true) {
//         case error.message.includes('__AuctionLogic_UnauthorizedToCall'):
//           message = "Error: You cannot update this auction"
//           break
//         case error.message.includes('__AuctionLogic_InvalidAuctionState'):
//         case error.message.includes('__AuctionLogic_InvalidTime'):
//           message = "Error: Auction is no longer valid"
//           break
//         case error.message.includes('__AuctionLogic_BuyoutBidMustBeGreater'):
//           message = "Your buyout bid cannot be less than minimum bid"
//           break
//         case error.message.includes('__AuctionLogic_InvalidBidBuffer'):
//           message = "Error: Max bid buffer is 100 bps"
//           break
//         case error.message.includes('__AuctionLogic_InvalidDuration'):
//           message = "Error: Max duration for auction is 90 minutes"
//           break
//         default:
//           message = "An unexpected error occurred: Try again"
//       }
//        throw new Error(message, error);
//     }
   
//   }
// }

// export const bidInAuction = async (auctionId: bigint, bidAmount: bigint, account: Account) => {
//   const transaction = prepareContractCall({
//     contract,
//     method: "bidInAuction",
//     params: [auctionId, bidAmount],
//   });

//   try {
//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if(transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Bid placed successfully"
//       }
//     } else {
//       return {
//         success: false,
//         message: "Failed to place bid"
//       }
//     }
//   } catch (error: any) {
//     let message;
//     if (error?.message) {
//       switch (true) {
//         case error.message.includes('__Auction_InvalidBidTime'):
//           message = "Error: Auction is no longer valid"
//           break
//         case error.message.includes('__AuctionLogic_InvalidBidAmount'):
//           message = "Error placing bid: Try adjusting your bid"
//           break
//         default:
//           message = "An unexpected error occurred: Try again"
//       }
//        throw new Error(message, error);
//     }
   
//   }
// }

// export const collectAuctionPayout = async (auctionId: bigint, account: Account) => {
//   const transaction = prepareContractCall({
//     contract,
//     method: "collectAuctionPayout",
//     params: [auctionId],
//   });

//   try {
//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if(transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Auction payout collected successfully"
//       }
//     } else {
//       return {
//         success: false,
//         message: "Failed to collect auction payout"
//       }
//     }
//   } catch (error: any) {
//     let message;
//     if (error?.message) {
//       switch (true) {
//         case error.message.includes('__AuctionLogic_InvalidAuctionState'):
//           message = "Error: Auction is no longer valid"
//           break
//         case error.message.includes('__AuctionLogic_UnauthorizedToCall'):
//           message = "You are not authorized to collect payout for this listing"
//           break
//         case error.message.includes('__AuctionLogic_NoBidYet'):
//           message = "Error: No bid placed"
//           break
//         default:
//           message = "An unexpected error occurred: Try again"
//       }
//       throw new Error(message, error);
//     }
    
//   }
// }

// export const collectAuctionTokens = async (auctionId: bigint, account: Account) => {
//   const transaction = prepareContractCall({
//     contract,
//     method: "collectAuctionTokens",
//     params: [auctionId],
//   });

//   try {
//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if(transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Auction tokens collected successfully"
//       }
//     } else {
//       return {
//         success: false,
//         message: "Failed to collect auction tokens"
//       }
//     }
//   } catch (error: any) {
//     let message;
//     if (error?.message) {
//       switch (true) {
//         case error.message.includes('__AuctionLogic_InvalidAuctionState'):
//           message = "Error: Auction is no longer valid"
//           break
//         case error.message.includes('__AuctionLogic_UnauthorizedToCall'):
//           message = "You are not authorized to collect tokens for this listing"
//           break
//         default:
//           message = "An unexpected error occurred: Try again"
//       }
//       throw new Error(message, error);
//     }
    
//   }
// }





// export const updateListing = async (listingId: bigint,  currency: string,  pricePerToken: bigint,  account: Account) => {

//   const transaction = prepareContractCall({
//   contract,
//   method: "updateListing",
//   params: [listingId, {currency, pricePerToken}],
  
// });


// try {

// const { transactionHash } = await sendTransaction({
//   account,
//   transaction,
// }); 
// console.log(transactionHash)

// return {
//   success: true,
//   message: "Listing updated successfully"
//   }
// } catch (error: any) {
//    let message;
//   if (error?.message.includes('__DirectListing_NotAuthorizedToUpdate')) {
//    message = "You are not authorized to update this listing"  
//   }
   
//    if (error?.message.includes('__DirectListing_InvalidId')){
//     message = "Error: Invalid listing"
//   }
//   if (error?.message.includes('__DirectListing_InvalidListingCurrency')){
//     message = "Error: Invalid currency"
//   }
//   else {
//     message = "An unexpected error occured: Try again"
//   }

//   return {
//     success: false,
//     message: message 
//   }

// }

// }




// export const updateListingPlan = async (listingId: bigint,  listingPlan:ListingType,  account: Account) => {

  
   

//     const listing = await readContract({
//      contract,
//      method:"getListing",
//       params: [listingId]
//     })

    
//     let fee: bigint | undefined ;

//   if (listing.currency == NATIVE_TOKEN){


//     const data = await readContract({
//      contract,
//      method:"getListingType",
//       params: [listingPlan]
//     })
   
//      fee = await readContract({
//      contract,
//      method:"getPlatformFee",
//       params: [listing.currency, data[1]]
//     })
     
//    }
//    else {
//     fee = undefined;
//    }


//   const transaction = prepareContractCall({
//   contract,
//   method: "updateListingPlan",
//   params: [listingId, listingPlan],
//   value: fee
  
// });


// try {

// const { transactionHash } = await sendTransaction({
//   account,
//   transaction,
// }); 
// console.log(transactionHash)

// return {
//   success: true,
//   message: "Listing Plan updated"
//   }
// } catch (error: any) {
//    let message;
//   if (error?.message.includes('__DirectListing_NotAuthorizedToUpdate')) {
//    message = "You are not authorized to update this listing"  
//   }
   
//    if (error?.message.includes('__DirectListing_TransferFailed')){
//     message = "Error: Transfer failed"
//   }

//   else {
//     message = "An unexpected error occured: Try again"
//   }
  

//   return {
//     success: false,
//     message: message 
//   }

// }

// }



// export const cancelListing = async (listingId: bigint, account: Account) => {

//   const transaction = prepareContractCall({
//   contract,
//   method: "cancelListing",
//   params: [listingId],
  
// });


// try {

// const { transactionHash } = await sendTransaction({
//   account,
//   transaction,
// }); 
// console.log(transactionHash)

// return {
//   success: true,
//   message: "Listing cancelled"
//   }
// } catch (error: any) {
//    let message;
//   if (error?.message.includes('__DirectListing_NotAuthorizedToCancel')) {
//    message = "You are not authorized to cancel this listing"  
//   }
   

//   else {
//     message = "An unexpected error occured: Try again"
//   }
  

//   return {
//     success: false,
//     message: message 
//   }

// }

// }



// export const approveBuyerForListing = async (listingId: bigint, buyer: string, account: Account) => {

//   const transaction = prepareContractCall({
//   contract,
//   method: "approveBuyerForListing",
//   params: [listingId, buyer],
  
// });


// try {

// const { transactionHash } = await sendTransaction({
//   account,
//   transaction,
// }); 
// console.log(transactionHash)

// return {
//   success: true,
//   message: "Buyer approved for listing"
//   }
// } catch (error: any) {
//    let message;
//   if (error?.message.includes('__DirectListing_NotAuthorizedToApproveBuyerForListing')) {
//    message = "You are not authorized to approve a buyer"  
//   }
   
//   if (error?.message.includes('__DirectListing_InvalidAddress')) {
//    message = "Error: Invalid address"  
//   }
//   if (error?.message.includes('__DirectListing_CanOnlyApproveABuyer')) {
//    message = "Error: You can only approve a buyer "  
//   }
   

//   else {
//     message = "An unexpected error occured: Try again"
//   }
  

//   return {
//     success: false,
//     message: message 
//   }

// }

// }



// export const removeApprovedBuyerForListing = async (listingId: bigint, account: Account) => {

//   const transaction = prepareContractCall({
//   contract,
//   method: "removeApprovedBuyerForListing",
//   params: [listingId],
  
// });


// try {

// const { transactionHash } = await sendTransaction({
//   account,
//   transaction,
// }); 
// console.log(transactionHash)

// return {
//   success: true,
//   message: "Buyer unapproved for listing"
//   }
// } catch (error: any) {
//    let message;
//   if (error?.message.includes('__DirectListing_NotAuthorizedToRemoveBuyerForListing')) {
//    message = "You are not authorized to unapprove a buyer"  
//   }
   
  
//   if (error?.message.includes('__DirectListing_CanOnlyRemoveApprovedBuyer')) {
//    message = "Error: You can only remove an approved buyer "  
//   }
   

//   else {
//     message = "An unexpected error occured: Try again"
//   }
  

//   return {
//     success: false,
//     message: message 
//   }

// }

// }



