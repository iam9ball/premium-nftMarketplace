import {
  prepareContractCall,
  sendAndConfirmTransaction,
  toWei,
} from "thirdweb";
import { getListing } from "./listingInfo";
import { NATIVE_TOKEN } from "../utils/address";
import { Account } from "thirdweb/wallets";
import { marketContract } from "../constant";

// export const makeOffer = async (
//   duration: bigint,
//   totalPrice: string,
//   listingId: bigint,
//   account: Account
// ) => {
//   try {
//     const data = await getListing(listingId);
//     let fee: string;

//     if (data?.currency === NATIVE_TOKEN) {
//       fee = totalPrice;
//     } else {
//       fee = "0";
//     }

//     const priceInWei = toWei(fee);
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "makeOffer",
//       params: [{ totalPrice: priceInWei!, duration }, listingId],
//       value: priceInWei,
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Offer sent successfully",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error sending offer",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Offer_InvalidListingId"):
//         message = "Error: Invalid listing";
//         break;
//       case error?.message.includes("__Offer_InsufficientFunds"):
//         message = "Insufficient Offer amount";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };

// export const cancelOffer = async (
//   offerId: bigint,
//   listingId: bigint,
//   account: Account
// ) => {
//   try {
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "cancelOffer",
//       params: [offerId, listingId],
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Offer cancelled",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error cancelling offer",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Offer_InvalidListingId"):
//         message = "Error: Invalid listing";
//         break;
//       case error?.message.includes("__Offer_UnauthorizedToCall"):
//         message = "You are not authorized to cancel this offer";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };

// export const acceptOffer = async (
//   offerId: bigint,
//   listingId: bigint,
//   account: Account
// ) => {
//   try {
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "acceptOffer",
//       params: [offerId, listingId],
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Offer accepted",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error accepting offer",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Offer_InvalidListingId"):
//         message = "Error: Invalid listing";
//         break;
//       case error?.message.includes("__Offer_UnauthorizedToCall"):
//         message = "You are not authorized to accept this offer";
//         break;
//       case error?.message.includes("__Offer_MarketPlaceUnapproved"):
//         message = "Error: Offer is not valid";
//         break;
//       case error?.message.includes("__Offer_InsufficientFunds"):
//         message = "Error: Insufficient funds";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };

// export const rejectOffer = async (
//   offerId: bigint,
//   listingId: bigint,
//   account: Account
// ) => {
//   try {
//     const transaction = prepareContractCall({
//       contract: marketContract,
//       method: "rejectOffer",
//       params: [offerId, listingId],
//     });

//     const transactionReceipt = await sendAndConfirmTransaction({
//       account,
//       transaction,
//     });

//     if (transactionReceipt.status === "success") {
//       return {
//         success: true,
//         message: "Offer rejected",
//       };
//     } else {
//       return {
//         success: false,
//         message: "Error rejecting offer",
//       };
//     }
//   } catch (error: any) {
//     let message;

//     switch (true) {
//       case error?.message.includes("__Offer_InvalidListingId"):
//         message = "Error: Invalid listing";
//         break;
//       case error?.message.includes("__Offer_UnauthorizedToCall"):
//         message = "You are not authorized to reject this offer";
//         break;
//       case error?.message.includes("__Offer_InsufficientFunds"):
//         message = "Error: Insufficient funds";
//         break;
//       default:
//         message = "An unexpected error occurred: Try again";
//     }

//     throw new Error(message, error);
//   }
// };




export const getErrorMessage = (error: any): string => {
  switch (true) {
    // Offer-specific errors
    case error?.message.includes("__Offer_InvalidListingId"):
      return "Invalid listing ID.";
    case error?.message.includes("__Offer_UnauthorizedToCall"):
      return "Unauthorized action.";
    case error?.message.includes("__Offer_InsufficientFunds"):
      return "Insufficient funds or allowance.";
    case error?.message.includes("__Offer_MarketPlaceUnapproved"):
      return "Marketplace not approved for this token.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};



export const makeOffer = async (
  duration: bigint,
  totalPrice: string,
  listingId: bigint,
  account: Account
) => {
  try {
    const data = await getListing(listingId);
    let fee: string;

    if (data?.currency === NATIVE_TOKEN) {
      fee = totalPrice;
    } else {
      fee = "0";
    }

    const priceInWei = toWei(fee);
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "makeOffer",
      params: [{ totalPrice: priceInWei!, duration }, listingId],
      value: priceInWei,
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Offer sent successfully",
      };
    } else {
      return {
        success: false,
        message: "Error sending offer",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};

export const cancelOffer = async (
  offerId: bigint,
  listingId: bigint,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "cancelOffer",
      params: [offerId, listingId],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Offer cancelled",
      };
    } else {
      return {
        success: false,
        message: "Error cancelling offer",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};


export const acceptOffer = async (
  offerId: bigint,
  listingId: bigint,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "acceptOffer",
      params: [offerId, listingId],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Offer accepted",
      };
    } else {
      return {
        success: false,
        message: "Error accepting offer",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};


export const rejectOffer = async (
  offerId: bigint,
  listingId: bigint,
  account: Account
) => {
  try {
    const transaction = prepareContractCall({
      contract: marketContract,
      method: "rejectOffer",
      params: [offerId, listingId],
    });

    const transactionReceipt = await sendAndConfirmTransaction({
      account,
      transaction,
    });

    if (transactionReceipt.status === "success") {
      return {
        success: true,
        message: "Offer rejected",
      };
    } else {
      return {
        success: false,
        message: "Error rejecting offer",
      };
    }
  } catch (error: any) {
    const message = getErrorMessage(error);
    throw new Error(message, error);
  }
};