import {
  sendAndConfirmTransaction, sendTransaction,
  prepareContractCall,
  readContract,
} from "thirdweb";
import {contractAddress, marketContract} from "../constant"
import { Account } from "thirdweb/wallets";
import { listingFee, listingTypeInfo } from "./listingInfo";
import { NATIVE_TOKEN } from "../utils/address";
import {toWei} from "thirdweb/utils"

import { approve, isERC721 } from "thirdweb/extensions/erc721";
import { isERC1155, setApprovalForAll } from "thirdweb/extensions/erc1155";
import { Contract } from "../utils/Contract";


export enum ListingType {
        BASIC,
        ADVANCED,
        PRO
    }




export const getErrorMessage = (error: any): string => {
  switch (true) {
    case error?.message.includes("__DirectListing_TransferFailed"):
      return "Insufficient fee. Send the required amount.";
    case error?.message.includes("__DirectListing_InvalidAccessToCall"):
      return "Unauthorized action.";
    case error?.message.includes("__DirectListing_InvalidId"):
      return "Invalid listing ID.";
    case error?.message.includes("__DirectListing_NotAuthorizedToUpdate"):
      return "You can't update this listing.";
    case error?.message.includes("__DirectListing_InvalidListingCurrency"):
      return "Invalid currency. Use an approved one.";
    case error?.message.includes("__DirectListing_InsufficientFunds"):
      return "Insufficient funds or allowance.";
    case error?.message.includes("__DirectListing_BuyerNotApproved"):
      return "You're not approved to buy this listing.";
    case error?.message.includes("__DirectListing_InvalidRequirementToCompleteASale"):
      return "Can't purchase. Check listing status.";
    case error?.message.includes("__DirectListing_NotAuthorizedToCancel"):
      return "You can't cancel this listing.";
    case error?.message.includes("__DirectListing_CanOnlyApproveABuyer"):
      return "Can only approve buyers for reserved listings.";
    case error?.message.includes("__DirectListing_CanOnlyRemoveApprovedBuyer"):
      return "Can only remove approved buyers.";
    case error?.message.includes("__DirectListing_InvalidAddress"):
      return "Invalid address.";
    case error?.message.includes("__DirectListing_InvalidAssetContract"):
      return "Invalid asset. Only ERC721/ERC1155 supported.";
    case error?.message.includes("__DirectListing_InvalidListerRequirements"):
      return "You don't own this token or haven't approved the marketplace.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

export const createListing = async (
  {
    assetAddress,
    assetId,
    currencyAddress,
    assetPrice,
    listingPlan,
    reserved,
  }: {
    assetAddress: string;
    assetId: bigint;
    currencyAddress: string;
    assetPrice: bigint;
    listingPlan: ListingType;
    reserved: boolean;
  },
  account: Account
) => {
  try {
    const data = await listingTypeInfo(listingPlan);
    let fee: bigint;
    if (currencyAddress == NATIVE_TOKEN) {
      fee = await listingFee(currencyAddress, data?.[1]!);
      console.log(fee);
    } else {
      fee = BigInt(0);
    }

    // Approve the contract
    const assetContract = Contract(assetAddress);

    const erc721 = await isERC721({
      contract: assetContract,
    });

    const erc1155 = await isERC1155({
      contract: assetContract,
    });

    let approveTransaction;
    if (erc721) {
      approveTransaction = approve({
        contract: assetContract,
        to: contractAddress,
        tokenId: assetId,
      });
    } else if (erc1155) {
      approveTransaction = setApprovalForAll({
        contract: assetContract,
        operator: contractAddress,
        approved: true,
      });
    }

    const transactionReceipt = await sendAndConfirmTransaction({
      transaction: approveTransaction!,
      account,
    });

    if (transactionReceipt.status === "success") {
      const priceInWei = toWei(assetPrice?.toString());

      const transaction = prepareContractCall({
        contract: marketContract,
        method: "createListing",
        params: [
          {
            assetContract: assetAddress,
            tokenId: assetId,
            currency: currencyAddress,
            pricePerToken: priceInWei,
            listingType: listingPlan,
            reserved,
          },
        ],
        value: fee,
      });

      const transactionReceipt = await sendAndConfirmTransaction({
        account,
        transaction,
      });

      if (transactionReceipt.status === "success") {
        return {
          success: true,
          message: "Listing created successfully",
        };
      } else {
        return {
          success: false,
          message: "Error creating listing",
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

export const buyListing = async (
  recipientAddress: string,
  listingId: bigint,
  account: Account
) => {
  try {
    let fee: bigint ;

    const data = await readContract({
      contract: marketContract,
      method: "getListing",
      params: [listingId],
    });

    if (data.currency == NATIVE_TOKEN) {
      fee = data.pricePerToken;
      console.log(fee);
    } else {
      fee = BigInt(0);
    }

    const transaction = prepareContractCall({
      contract: marketContract,
      method: "buyFromListing",
      params: [listingId, recipientAddress],
      value: fee,
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Listing purchased successfully",
      };
    } else {
      return {
        success: false,
        message: "Error purchasing listing",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};


export const cancelListing = async (listingId: bigint, account: Account) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "cancelListing",
      params: [listingId],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Listing cancelled",
      };
    } else {
      return {
        success: false,
        message: "Error cancelling listing",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};


export const removeApprovedBuyerForListing = async (
  listingId: bigint,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "removeApprovedBuyerForListing",
      params: [listingId],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Buyer removed for listing",
      };
    } else {
      return {
        success: false,
        message: "Error removing buyer",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};

export const approveBuyerForListing = async (
  listingId: bigint,
  buyer: string,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "approveBuyerForListing",
      params: [listingId, buyer],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Buyer approved for listing",
      };
    } else {
      return {
        success: false,
        message: "Error approving buyer",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};

export const updateListingPlan = async (
  listingId: bigint,
  listingPlan: ListingType,
  account: Account
) => {
  try {
    const listing = await readContract({
      contract: marketContract,
      method: "getListing",
      params: [listingId],
    });

    let fee: bigint;

    if (listing.currency == NATIVE_TOKEN) {
      const data = await readContract({
        contract: marketContract,
        method: "getListingType",
        params: [listingPlan],
      });

      fee = await readContract({
        contract: marketContract,
        method: "getPlatformFee",
        params: [listing.currency, data[1]],
      });
    } else {
      fee = BigInt(0);
    }

    const transaction = prepareContractCall({
      contract: marketContract,
      method: "updateListingPlan",
      params: [listingId, listingPlan],
      value: fee,
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Listing Plan updated",
      };
    } else {
      return {
        success: false,
        message: "Error updating listing plan",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};


export const updateListing = async (
  listingId: bigint,
  currency: string,
  pricePerToken: bigint,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "updateListing",
      params: [listingId, { currency, pricePerToken }],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Listing updated successfully",
      };
    } else {
      return {
        success: false,
        message: "Error updating listing",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};
