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
   let fee: bigint;
    if(auction.currency == NATIVE_TOKEN) {
      fee = amount
    } else {
      fee = BigInt(0)
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






