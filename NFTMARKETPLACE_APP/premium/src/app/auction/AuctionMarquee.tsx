"use client";
import Marquee from "react-fast-marquee";
import { AuctionItem } from "./AuctionItem";
import { getAllAuctions, getWinningBid } from "../contracts/auctionInfo";
import { getAuction } from "../contracts/auctionInfo";
import useSWR from "swr";
import { Contract } from "../utils/Contract";
import { fetchNFT } from "../contracts/listingInfo";
import { toEther } from "thirdweb";
import { tokenInfo } from "../hooks/useCurrency";

export function AuctionMarquee() {
  const fetchActiveAuctions = async () => {
    try {
      const auction = await getAllAuctions();

      const activeAuctions: any[] = [];

      const results = await Promise.allSettled(
        auction.map(async (auction: any) => {
          const auctionResult = await getAuction(auction.auctionId);

          console.log("auctionResult", auctionResult);
          const contract = Contract(auction.assetContract);

          const nft = await fetchNFT(contract, auction.tokenType, auction.tokenId);
         
          const value = await getWinningBid(auction.auctionId)
         
          const currency =  tokenInfo(value[1]);
         
          const data = {
            ...auctionResult,
            name: nft?.metadata.name,
            bid: value[2],
            symbol: currency?.symbol
          };
          return data;
        })
      );
  //filter based on `status
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.startTimestamp <= Math.floor(Date.now()/1000)) {
          activeAuctions.push(result.value);
        }
      });

      return activeAuctions;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  console.log("fetchActiveAuctions", fetchActiveAuctions());
  const { data, error, isLoading } = useSWR(
    "ActiveAuctions",
    fetchActiveAuctions,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5000,
      shouldRetryOnError: false,
    }
  );

  if(data?.length === 0 && !isLoading) {
    return
  }
  if(error) {
    console.error(error);
    return
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r z-[100] w-auto justify-evenly bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-40 p-4">
      <Marquee gradient={false} speed={40}>
        <div className="flex space-x-4">
          {data?.map(async (auction) => (
            <AuctionItem
              key={auction.auctionId}
              id={auction.auctionId}
              name={auction.name}
              currentBid={toEther(auction.bid)}
              endTime={auction?.endTimestamp?.toString()}
              currency={auction.symbol}
            />
          ))}
        </div>
      </Marquee>
    </div>
  );
}
