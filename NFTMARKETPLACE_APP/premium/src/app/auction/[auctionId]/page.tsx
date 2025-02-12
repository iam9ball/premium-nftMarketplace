"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import AuctionCommentary from "../AuctionCommentary";
import AuctionDetails from "../AuctionDetails";
import BiddingSystem from "../BiddingSystem";
import LiveChat from "../LiveChat";
import RotatingCube from "../RotatingItem";
import Container from "../../components/Container";
import { getAuction } from "@/app/contracts/auctionInfo";
import { Contract } from "@/app/utils/Contract";
import { fetchNFT } from "@/app/contracts/listingInfo";
import { ipfsToHttp } from "@/app/utils/ipfsToHttp";
import LeaveButton from "../LeaveButton";
import Loading from "../Loading";
import Error from "@/app/components/Error";
import { tokenInfo } from "@/app/hooks/useCurrency";
import { toEther } from "thirdweb";

export default function Page({
  params: { auctionId },
}: {
  params: { auctionId: string };
}) {
  const router = useRouter();

  const fetchAuction = async () => {
    try {
      console.log("auctionId", auctionId);
      const auction = await getAuction(BigInt(auctionId));
      const contract = Contract(auction.assetContract);
      const nft = await fetchNFT(contract, auction.tokenType, auction.tokenId);
        const currency =  tokenInfo(auction.currency);
        const symbol = currency?.symbol;
      return { ...auction, nft, symbol };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, error, isLoading } = useSWR(
    auctionId ? `auction-${auctionId}` : null,
    fetchAuction,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  if (isLoading) {
    return <Loading/>
  }

  if (error) {
   return  <Error error={error}/>
  }
  const auctionImage = ipfsToHttp(data?.nft?.metadata.image!);

  return (
    <div className="min-h-screen w-full bg-gray-900 relative">
      <LeaveButton onClick={() => router.push("/marketplace")} />
      <Container>
        <div className="py-4 min-h-screen flex flex-col">
          {/* Mobile View: Rotating Cube takes full width */}
          <div className="block lg:hidden w-[90%] mb-10">
            <RotatingCube
              frontImage={auctionImage}
              backImage={auctionImage}
              leftImage={auctionImage}
              rightImage={auctionImage}
              topImage={auctionImage}
              bottomImage={auctionImage}
            />
          </div>

          {/* Main Content Grid */}
          <div className="flex flex-col lg:flex-row gap-4 flex-grow">
            {/* Left Column */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              {/* Hide Rotating Cube on mobile, show on desktop */}
              <div className="hidden lg:block">
                <RotatingCube
                  frontImage={auctionImage}
                  backImage={auctionImage}
                  leftImage={auctionImage}
                  rightImage={auctionImage}
                  topImage={auctionImage}
                  bottomImage={auctionImage}
                />
              </div>
              <div className="flex-grow lg:mt-12">
                <AuctionDetails auctionItem={data?.nft?.metadata.name} />
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <BiddingSystem
                auctionId={auctionId}
                endTime={data?.endTimestamp?.toString()!}
                bufferBps={Number(data?.bidBufferBps)}
                symbol={data?.symbol!}
                status={data?.status!}
                minBid={toEther(data?.minimumBidAmount!)}
                buyoutBid={toEther(data?.buyoutBidAmount!)}
              />
              <AuctionCommentary
                status={data?.status!}
                endTime={Number(data?.endTimestamp)}
              />
              <LiveChat />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
