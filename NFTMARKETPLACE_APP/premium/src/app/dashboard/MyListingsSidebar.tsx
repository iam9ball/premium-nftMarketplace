"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Edit, Trash, DollarSign, UserCheck, UserMinus } from "lucide-react";
import { ListingItem } from "./MyListings";
import Image from "next/image";
import {
  cancelListing,
  removeApprovedBuyerForListing
} from "../contracts/listing";
import { useActiveAccount } from "thirdweb/react";
import toast from "react-hot-toast";
import { showToast } from "@/app/components/WalletToast";
import UpdateListingModal from "../components/modal/UpdateListingModal";
import UpdateListingPlanModal from "../components/modal/UpdateListingPlanModal";
import ApproveBuyerModal from "../components/modal/ApproveBuyerModal";
import { shortenAddress } from "thirdweb/utils";
import { ZERO_ADDRESS } from "thirdweb";
import useInfiniteScrollMutateStore from "@/app/hooks/useInfiniteScrollMutateStore";
import { getApprovedBuyer } from "../contracts/listingInfo";

interface MyListingsSidebarProps {
  listing: ListingItem ;
  onClose: () => void;
  isVisible: boolean;
}

export default function MyListingsSidebar({
  listing,
  onClose,
  isVisible,
}: MyListingsSidebarProps) {
  const account = useActiveAccount();
  const [openUpdateListingModal, setOpenUpdateListingModal] =
    useState<boolean>(false);
  const [openUpdateListingPlanModal, setOpenUpdateListingPlanModal] =
    useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [openApproveBuyerForListing, setOpenApproveBuyerForListing] =
    useState(false);
  const { dashboardRefreshListings } = useInfiniteScrollMutateStore();
  const [buyer, setBuyer] = useState<string>(ZERO_ADDRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");


  const handleClose = () => {
    setTimeout(onClose, 300);
  };

  // Update Listing Modal
  const handleOpenUpdateListingModal = () => {
    setOpenUpdateListingModal(true);
  };

  const handleCloseUpdateListingModal = () => {
    setOpenUpdateListingModal(false);
  };

  // Approve Buyer For Listing Modal
  const handleOpenApproveBuyerForListing = () => {
    setOpenApproveBuyerForListing(true);
  };
  const handleCloseApproveBuyerForListing = () => {
    setOpenApproveBuyerForListing(false);
  };

  // Update Listing Plan Modal
  const handleOpenUpdateListingPlan = () => {
    setOpenUpdateListingPlanModal(true);
  };
  const handleCloseUpdateListingPlan = () => {
    setOpenUpdateListingPlanModal(false);
  };


  const handleRemoveApprovedBuyerForListing = async () => {
    if (account) {
      try {
        setIsDisabled(true); //  setIsDisabled(true);
        await removeApprovedBuyerForListing(listing?.listingId, account).then(
          async (data) => {
            if (data.success) {
              toast.success(data.message);
             await dashboardRefreshListings?.();
             handleClose();
            } else {
              toast.error(data.message);
            }
          }
        );
      } catch (error: any) {
        toast.error(error.message);
        console.error(error);
      } finally {
        setIsDisabled(false);
      }
    } else {
      showToast();
    }
  };

  const handleCancel = async () => {
    if (account) {
      try {
        setIsDisabled(true);
        await cancelListing(listing?.listingId, account).then(async (data) => {
          if (data.success) {
            toast.success(data.message);
           await dashboardRefreshListings?.();
           handleClose();

          } else {
            toast.error(data.message);
          }
        });
      } catch (error: any) {
        toast.error(error.message);
        console.error(error);
      } finally {
        setIsDisabled(false);
      }
    } else {
      showToast();
    }
  };


  

  useEffect(() => {
    const getBuyer = async (listing: ListingItem) => {
      try {

        // if (!listing?.listingId) {
        //   setBuyer(ZERO_ADDRESS);
        //   return;
        // }
        const buyer = await getApprovedBuyer(listing.listingId);
        setIsLoading(false);
        setBuyer(buyer || ZERO_ADDRESS); // Ensure we never set undefined
      } catch (error) {
        console.error("Error fetching approved buyer:", error);
        setError("Error fetching approved buyer");
        // setBuyer(ZERO_ADDRESS); // Set to ZERO_ADDRESS on error
      }
    };

    if (listing) {
      getBuyer(listing);
    }
  }, []);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 right-0 top-0 z-50 flex flex-col h-[100vh]
          w-full sm:max-w-[calc(100vw-8rem)] md:max-w-[320px] lg:max-w-[460px]
          transform transition-transform duration-300 ease-in-out
          ${isVisible ? "translate-x-0" : "translate-x-full"}
          bg-white shadow-xl`}
      >
        <div className="flex items-center justify-end p-2 sm:p-4 border-b border-gray-200">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 sm:p-4 space-y-4">
            {/* Card */}
            {listing && (
              <div className="w-full max-w-[90vw] sm:max-w-none mx-auto">
                <div className="relative h-[350px]">
                  <Image
                    src={listing.src}
                    alt={listing.alt}
                    fill
                    style={{ objectFit: "cover" }}
                    className="transition-transform duration-500 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 20vw"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={handleOpenUpdateListingModal}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold 
                    py-2.5 sm:py-3 px-4 rounded flex items-center justify-center 
                    transition-colors text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Edit Listing
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold 
                    py-2.5 sm:py-3 px-4 rounded flex items-center justify-center 
                    transition-colors text-sm sm:text-base"
                  disabled={isDisabled}
                >
                  <Trash className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Cancel Listing
                </button>
              </div>

              <button
                onClick={handleOpenUpdateListingPlan}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold 
                  py-2.5 sm:py-3 px-4 rounded flex items-center justify-center 
                  transition-colors text-sm sm:text-base"
              >
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Update Listing Plan
              </button>
            </div>

            {/* Buyers Section */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                Manage Buyer
              </h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto rounded-lg border border-gray-200">
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between 
                      p-3 sm:p-4 hover:bg-gray-50 transition-colors border-b 
                      last:border-b-0 border-gray-200 gap-3 sm:gap-4"
                >
                  <span className="font-medium text-sm sm:text-base text-center md:text-start">
                    {isLoading ? (
                      <span className="font-medium text-sm sm:text-base text-gray-500">
                        Loading...
                      </span>
                    ) : error ? (
                      <span className="font-medium text-xs  text-red-500">
                        {error}
                      </span>
                    ) : buyer && buyer !== ZERO_ADDRESS ? (
                      <span className="font-medium text-sm sm:text-base">
                        {shortenAddress(buyer)}
                      </span>
                    ) : (
                      <span className="font-medium text-sm sm:text-base text-gray-500">
                        No approved buyer, Approve a buyer
                      </span>
                    )}
                  </span>
                  <div className="flex gap-2 sm:gap-3">
                    {buyer && buyer == ZERO_ADDRESS ? (
                      <button
                        className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 
                          text-white font-semibold py-2 px-3 rounded text-xs sm:text-sm 
                          flex items-center justify-center transition-colors"
                        onClick={handleOpenApproveBuyerForListing}
                      >
                        <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        Approve
                      </button>
                    ) : (
                      <button
                        className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 
                          text-white font-semibold py-2 px-3 rounded text-xs sm:text-sm 
                          flex items-center justify-center transition-colors"
                        onClick={handleRemoveApprovedBuyerForListing}
                      >
                        <UserMinus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                {/* ))} */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {listing && (
        <>
          <UpdateListingModal
            listing={listing}
            onClose={handleCloseUpdateListingModal}
            isOpen={openUpdateListingModal}
            onSuccess={handleClose}
          />
          <UpdateListingPlanModal
            listingId={listing?.listingId}
            listingPlan={listing?.listingPlan}
            onClose={handleCloseUpdateListingPlan}
            isOpen={openUpdateListingPlanModal}
            onSuccess={handleClose}
          />
          <ApproveBuyerModal
            listingId={listing?.listingId}
            onClose={handleCloseApproveBuyerForListing}
            isOpen={openApproveBuyerForListing}
            onSuccess={handleClose}
          />
        </>
      )}
    </>
  );
}
