
// "use client";

// import {  useState } from "react";
// import { X, Edit, Trash } from "lucide-react";
// import Image from "next/image";
// import { useActiveAccount } from "thirdweb/react";
// import useInfiniteScrollMutateStore from "@/app/hooks/useInfiniteScrollMutateStore";

// import { auctionItem } from "./MyAuctions";

// interface MyAuctionsSidebarProps {
//   auctions: auctionItem;
//   onClose: () => void;
//   isVisible: boolean;
// }

// export default function MyAuctionsSidebar({
//   auctions,
//   onClose,
//   isVisible,
// }: MyAuctionsSidebarProps) {
//   const account = useActiveAccount();
//   const [isDisabled, setIsDisabled] = useState<boolean>(false);
//  const { dashboardRefreshListings } = useInfiniteScrollMutateStore();

//   return (
//     <>
//       {/* Backdrop overlay */}
//       <div
//         className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
//           isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={onClose}
//       />

//       {/* Sidebar Container */}
//       <div
//         className={`fixed inset-y-0 right-0 z-50 flex flex-col h-[100vh]
//           w-full sm:max-w-[calc(100vw-8rem)] md:max-w-[320px] lg:max-w-[460px]
//           transform transition-transform duration-300 ease-in-out
//           ${isVisible ? "translate-x-0" : "translate-x-full"}
//           bg-white shadow-xl`}
//       >
//         <div className="flex items-center justify-end p-2 sm:p-4 border-b border-gray-200">
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
//           >
//             <X className="w-5 h-5 sm:w-6 sm:h-6" />
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-2 sm:p-4 space-y-4">
//             {/* Card */}
//             {auctions && (
//               <div className="w-full max-w-[90vw] sm:max-w-none mx-auto">
//                 <div className="relative h-[350px]">
//                   <Image
//                     src={auctions.src}
//                     alt={auctions.name}
//                     fill
//                     style={{ objectFit: "cover" }}
//                     className="transition-transform duration-500 ease-in-out group-hover:scale-110"
//                     sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 20vw"
//                     priority
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                 <button
//                   onClick={() => {}}
//                   className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold 
//                     py-2.5 sm:py-3 px-4 rounded flex items-center justify-center 
//                     transition-colors text-sm sm:text-base"
//                 >
//                   <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                   Edit offer
//                 </button>
//                 <button
//                   onClick={() => {}}
//                   disabled={isDisabled}
//                   className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold 
//                     py-2.5 sm:py-3 px-4 rounded flex items-center justify-center 
//                     transition-colors text-sm sm:text-base"
//                 >
//                   <Trash className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
//                   Cancel offer
//                 </button>
//               </div>

          
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



"use client";

import {  useEffect, useMemo, useState } from "react";
import { X, Edit, Trash, DollarSign } from "lucide-react";
import Image from "next/image";
import { useActiveAccount } from "thirdweb/react";

import { auctionItem } from "./MyAuctions";
import { cancelAuction, collectAuctionPayout } from "../contracts/auction";
import toast from "react-hot-toast";
import { showToast } from "../components/WalletToast";
import UpdateAuctionModal from "../components/modal/UpdateAuctionModal";
import CongratsModal from "../components/modal/CongratsModal";
import useInfiniteScrollMutateStore from "@/app/hooks/useInfiniteScrollMutateStore";


interface MyAuctionsSidebarProps {
  auction: auctionItem;
  onClose: () => void;
  isVisible: boolean;
}

export default function MyAuctionsSidebar({
  auction,
  onClose,
  isVisible,
}: MyAuctionsSidebarProps) {
  const account = useActiveAccount();
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isOpenUpdateAuction, setOpenUpdateAuction] = useState<boolean>(false)
  const [isCongratsOpen, setIsCongratsOpen] = useState(false);
  const {dashboardRefreshListings} = useInfiniteScrollMutateStore();
 


  const handleOpenUpdateAuction = () => {
    setOpenUpdateAuction(true);
  };

  const handleCloseUpdateAuction = () => {
    setOpenUpdateAuction(false);
  };



  const handleCancel = async() => {
    if (account) {
      try{
       setIsDisabled(true);
      await cancelAuction(auction.auctionId, account).then(async (data) => {
        if (data?.success) {
          toast.success(data?.message!);

          onClose();
           await dashboardRefreshListings?.();
        } else {
          toast.error(data?.message!);
        }
      });
  } catch(error: any){
    toast.error(error.message)
    console.error(error)
  } finally{
   setIsDisabled(false)
  }
    }  else {
        showToast();
      }
   

  }


  const handleClaim = async () => {
    if (account) {
     
      try {
        setIsDisabled(true);
        await collectAuctionPayout(auction.auctionId, account).then(
          async (data) => {
            if (data?.success) {
              toast.success(data?.message!);
             
              onClose();
            
              setIsCongratsOpen(true)
            } else {
              toast.error(data?.message!);
            }
          },
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

  // useEffect(() => {
  //   const now = Math.floor(Date.now() / 1000);
  // }, [now]);
  const now = useMemo(() => {
    return Math.floor(Date.now()/ 1000)
  }, [])

  const auctionStatus = useMemo(() => {
    
        if (now < auction?.startTimestamp  ) {
          return "Auction is created and ready to start";
        } else if (now >= auction?.startTimestamp && now < auction?.endTimestamp) {
          return "Auction is live and accepting bids";
        } else if (now >= auction?.endTimestamp) {
          return "Auction has ended - ready for collection";
        } else {
          return "Auction is not active";
        }
  }, [now])


  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 md:hidden ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex flex-col h-[100vh]
          w-full sm:max-w-[calc(100vw-8rem)] md:max-w-[320px] lg:max-w-[460px]
          transform transition-transform duration-300 ease-in-out
          ${isVisible ? "translate-x-0" : "translate-x-full"}
          bg-white shadow-xl`}
      >
        <div className="flex items-center justify-end p-2 sm:p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 sm:p-4 space-y-4">
            {/* Card */}
            {auction && (
              <div className="w-full max-w-[90vw] sm:max-w-none mx-auto">
                <div className="relative h-[350px]">
                  <Image
                    src={auction.src}
                    alt={auction.name}
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
                  onClick={handleOpenUpdateAuction}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold 
                    py-2.5 sm:py-3 px-4 rounded flex items-center justify-center 
                    transition-colors text-sm sm:text-base cursor-pointer"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Edit auction
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isDisabled}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold 
                    py-2.5 sm:py-3 px-4 rounded flex items-center justify-center 
                    transition-colors text-sm sm:text-base cursor-pointer"
                >
                  <Trash className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Cancel auction
                </button>
              </div>
              {auction.status === 3 || now >= auction?.endTimestamp && (
                <button
                  onClick={handleClaim}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold 
                  py-2.5 sm:py-3 px-4 rounded flex items-center justify-center 
                  transition-colors text-sm sm:text-base cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Claim auction reward
                </button>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                Manage auction
              </h3>
              <div className="space-y-2 h-auto  rounded-lg border border-gray-200">
                <div
                  className="p-3 sm:p-4 flex flex-col hover:bg-gray-50 transition-colors border-b 
                    last:border-b-0 border-gray-200 gap-3 sm:gap-4"
                >
                  <div>
                    <span className="text-base font-bold italic">
                      {auctionStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {auction && (
        <UpdateAuctionModal
          auction={auction}
          onClose={handleCloseUpdateAuction}
          isOpen={isOpenUpdateAuction}
          onSuccess={onClose}
        />
      )}

      {isCongratsOpen && (
        <CongratsModal
          isOpen={isCongratsOpen}
          onClose={() => setIsCongratsOpen(false)}
        />
      )}
    </>
  );
}




