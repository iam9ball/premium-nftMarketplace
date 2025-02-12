'use client'
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import Button from '@/app/components/Button';
import Pulse from '@/app/components/Pulse';
import { ipfsToHttp } from '@/app/utils/ipfsToHttp';
import Image from 'next/image';
import useDialog from '@/app/hooks/useDialog';
import useBuyListingModal from '@/app/hooks/useBuyListingModal';
import { fetchNFT, getListing } from '@/app/contracts/listingInfo';

import useSWR from 'swr';
import useMakeOfferModal from '@/app/hooks/useMakeOfferModal';
import Error from '@/app/components/Error';
import useCreateListingModal from "@/app/hooks/useCreateListingModal";
import '@/app/styles/custom-scrollbar.css';
import { tokenInfo } from '@/app/hooks/useCurrency';
import { Copy } from 'lucide-react';
import DetailsSkeleton from "./DetailsSkeleton";
import { Contract } from '@/app/utils/Contract';
import { toEther } from 'thirdweb';
import { shortenAddress } from 'thirdweb/utils';

// const shortenAddress = (address: string) => {
//   return `${address.slice(0, 6)}...${address.slice(-4)}`;
// };



interface ListingDetailsProps {
  listingId: string;
}

export default function ListingDetails({ listingId }: ListingDetailsProps) {
  const dialog = useDialog();
  const buyListingModal = useBuyListingModal();
  const makeOfferModal = useMakeOfferModal();
  const createListingModal = useCreateListingModal();
  const [copied, setCopied] = useState(false);



  const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000); 
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

  const fetchListing = useCallback(async () => {
    try {
      const listing = await getListing(BigInt(listingId));
      if (!listing) return null;

      const contract = Contract(listing.assetContract);
       

      const nft = await fetchNFT(contract, listing.tokenType, listing.tokenId);
      const currency =  tokenInfo(listing.currency);

      return { ...listing, nft: nft, currency };
    } catch(error) {
      console.error('Error fetching listing:', error);
      throw error;
    }
  }, [listingId]);

  const { data, error, isLoading } = useSWR(
    "listing/" + listingId,
    fetchListing,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000,
      shouldRetryOnError: false,
    }
  );

 
  const listingStatus = useMemo(() => {
    switch (data?.status) {
      case 0: return "Inactive";
      case 1: return "Active";
      case 2: return "Sold";
      case 3: return "Cancelled";
    }
  }, [data?.status]);

  const tokenType = useMemo(() => {
    switch (data?.tokenType) {
      case 0: return "ERC721";
      case 1: return "ERC1155";
    }
  }, [data?.tokenType]);

  const isAnimating = useMemo(() => {
    return !(data?.status != 1);
  }, [data?.status]);

  

  

  const timeLeft = useMemo(() => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const endTime = Number(data?.endTimestamp);
    const timeDifferenceInSeconds = endTime - now;

    if (timeDifferenceInSeconds <= 0) {
      return "Listing Expired";
    }

    const days = Math.ceil(timeDifferenceInSeconds / 86400);
    return days > 1 ? `${days} days left` : "1 day left";
  }, [data?.endTimestamp]);

  const uri = useMemo(() => {
    return data?.nft?.metadata.image && ipfsToHttp(data?.nft.metadata.image);
  }, [data?.nft]);

  const alt = useMemo(() => {
    return data?.nft && data?.nft.metadata.name!;
  }, [data?.nft]);

  if(error) return <Error error={error}/>;

  if (isLoading) return <DetailsSkeleton/>

  if(data) return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <div className="w-full min-h-[90vh] p-3 md:p-6 flex justify-center items-center">
        <div className="w-full max-w-6xl relative">
          <div className="absolute inset-0 rounded-xl opacity-75 blur-sm bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600" />

          <div className="relative bg-gray-900 rounded-xl p-3 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 overflow-hidden">
            <div className="relative aspect-square w-full max-w-md mx-auto lg:max-w-none">
              <Image
                src={uri!}
                alt={alt!}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-lg transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="flex flex-col justify-center items-center lg:items-start space-y-6">
              <div className="space-y-6 w-full text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start">
                  <Pulse isAnimating={isAnimating} />
                  <span className="text-rose-300 ml-3 capitalize">
                    {listingStatus}
                  </span>
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold capitalize mb-2">
                    {data?.nft?.metadata.name}{" "}
                    <span className="text-rose-400">
                      #{data?.tokenId?.toString()}
                    </span>
                  </h1>
                  <p className="text-sm md:text-base lg:text-lg text-gray-300">
                    Listed by:{" "}
                    <span className="text-xs md:text-sm text-white">
                      {data?.listingCreator}
                    </span>
                  </p>
                  <p className="text-xl lg:text-2xl mt-4 font-semibold">
                    <span className="text-gray-300">Price: </span>
                    <span className="text-rose-400">
                      {toEther(data?.pricePerToken)}{" "}
                      <span className="uppercase">
                        {data?.currency?.symbol}
                      </span>
                    </span>
                  </p>
                </div>

                {data?.reserved && (
                  <div className="text-xl text-rose-300 font-semibold">
                    Reserved
                  </div>
                )}

                <div className="flex gap-4 justify-center lg:justify-start">
                  <Button
                    actionLabel="Make Offer"
                    classNames="flex-1 bg-transparent border-2 border-rose-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-rose-500/20 transition-all duration-300"
                    onClick={makeOfferModal.onOpen}
                  />
                  <Button
                    actionLabel="Buy Now"
                    classNames="flex-1 bg-rose-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-rose-600 transition-all duration-300"
                    onClick={dialog.onOpen}
                  />
                </div>

                <div className="flex items-center justify-center lg:justify-start mt-4">
                  <span className="text-rose-400">🕓</span>
                  <span className="text-gray-300 ml-4">{timeLeft}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full  p-4 md:p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-xl p-6 space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-4 text-center">
              Details
            </h2>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center justify-between">
                <span>Address:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-rose-300">
                    {shortenAddress(data?.assetContract)}
                  </span>
                  {copied ? (
                    <span className="text-xs text-green-500">Copied!</span>
                  ) : (
                    <button
                      onClick={() => copyToClipboard(data?.assetContract)}
                      className="p-1 hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="flex justify-between">
                Token Id:{" "}
                <span className="text-sm text-rose-300">
                  #{data?.tokenId?.toString()}
                </span>
              </p>
              <p className="flex justify-between">
                Token Standard:{" "}
                <span className="text-sm text-rose-300">{tokenType}</span>
              </p>
              <p className="flex justify-between">
                Royalty: <span className="text-sm text-rose-300">{data.nft?.result}%</span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-4">
              Description
            </h2>
            <div className="mt-4 text-gray-300 overflow-y-auto max-h-[150px] pr-4 custom-scrollbar">
              {data?.nft?.metadata.description || "No description available"}
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}