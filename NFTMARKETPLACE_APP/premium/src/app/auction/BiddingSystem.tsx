"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/Button";
import { useActiveAccount } from "thirdweb/react";
import { bidInAuction, collectAuctionTokens } from "../contracts/auction";
import toast from "react-hot-toast";
import { shortenAddress, toEther } from "thirdweb/utils";
import { getWinningBid } from "../contracts/auctionInfo";
import { prepareEvent, watchContractEvents } from "thirdweb";
import { marketContract } from "../constant";
import CongratsModal from "../components/modal/CongratsModal";

interface Bid {
  id: number;
  amount: number;
  bidder: string;
}

interface BiddingSystemProps {
  auctionId: string;
  endTime: string;
  bufferBps: number;
  symbol: string;
  status: number;
  minBid: string;
  buyoutBid: string; 
}

const generateRandomAddress = (): string => {
  const addr = [...Array(40)]
    .map(() => Math.floor(Math.random() * 16)?.toString(16))
    .join("");
  return `0x${addr}`;
};
export default function BiddingSystem({
  auctionId,
  endTime,
  bufferBps,
  symbol,
  status,
  minBid,
  buyoutBid,
}: BiddingSystemProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [currentBid, setCurrentBid] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const account = useActiveAccount();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isLoading, setIsLoading] = useState(false);
  const [isCongratsModalOpen, setIsCongratsModalOpen] = useState(false);
  const [latestWinner, setLatestWinner] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false); // 1 hour in seconds
  const connectButtonRef = useRef<HTMLDivElement | null>(null);

  const triggerConnect = () => {
    if (connectButtonRef.current) {
      const button = connectButtonRef.current.querySelector("button");
      if (button) {
        button.click();
      }
    }
  };

  function calculateTimeLeft() {
    const difference = +endTime - Math.floor(+new Date() / 1000);
    if (difference > 0) {
      return {
        hours: Math.floor((difference / (60 * 60)) % 24),
        minutes: Math.floor((difference / 60) % 60),
        seconds: Math.floor(difference % 60),
      };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  

  const handleClaim = async () => {
    if (account) {
      try {
        setIsDisabled(true);
        await collectAuctionTokens(BigInt(auctionId), account).then(
          async (data) => {
            if (data?.success) {
              toast.success(data?.message!);
              setIsCongratsModalOpen(false);
            } else {
              toast.error(data?.message!);
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
      triggerConnect();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // Artificial bid generation
  const addArtificialBid = useCallback(() => {
    // Only add artificial bids if status is not 3
    if (status !== 3) {
      const newBidAmount = currentBid + currentBid * (bufferBps / 100);
      const newBid = {
        id: Date.now(),
        amount: newBidAmount || 1,
        bidder: shortenAddress(generateRandomAddress()),
      };
      setBids([newBid]);
      setCurrentBid(newBid.amount);
    }
  }, [currentBid, bufferBps, status]);

  // Timer for artificial bids
  useEffect(() => {
    let bidTimer: NodeJS.Timeout;
    const currentTime = Math.floor(Date.now() / 1000);
    if (status !== 3 && currentTime < +endTime) {
      bidTimer = setInterval(() => {
        addArtificialBid();
      }, 5000);
    }
    return () => clearInterval(bidTimer);
  }, [addArtificialBid, status, endTime]);

  useEffect(() => {
    const fetchWinningBid = async () => {
      const bid = await getWinningBid(BigInt(auctionId));
      if (bid) {
        setCurrentBid(Number(toEther(bid[2])));
        if (
          status === 3 ||
          (Math.floor(Date.now() / 1000) > +endTime && bid[2] > 0)
        ) {
          setLatestWinner(shortenAddress(bid[0]));
          setIsCongratsModalOpen(true);
        }
      }
    };
    fetchWinningBid();
  }, [auctionId, status]);

  const handleBid = useCallback(async () => {
    if (!account) {
      triggerConnect();
      return;
    }

    if (!inputValue || isNaN(Number(inputValue))) {
      toast.error("Please enter a valid bid amount");
      return;
    }
    setIsLoading(true);
    try {
      await bidInAuction(BigInt(auctionId), inputValue, account).then(
        async (data) => {
          console.log(data);
          if (data?.success) {
            toast.success(data?.message);
            setInputValue("");
          } else {
            toast.error(data?.message!);
          }
        }
      );
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [account, auctionId, inputValue]);

  // Watch for real bids
  useEffect(() => {
    const fetchEvents = async () => {
      const newBidEvent = prepareEvent({
        signature:
          "event NewBid(uint256 indexed auctionId, address indexed bidder, uint256 indexed bidAmount)",
        filters: {
          auctionId: BigInt(auctionId),
        },
      });

      const unwatch = await watchContractEvents({
        contract: marketContract,
        events: [newBidEvent],
        onEvents: (events) => {
          events.forEach(async (event) => {
            const { args } = event;
            const { bidAmount, bidder } = args;
            const amount = toEther(bidAmount);
            const newBid = {
              id: Date.now(),
              amount: Number(amount),
              bidder: shortenAddress(bidder),
            };
            setBids([newBid]);
            setCurrentBid(newBid.amount);
          });
        },
      });

      return () => unwatch();
    };

    fetchEvents();
  }, [auctionId]);

  const { hours, minutes, seconds } = timeLeft;

  const bidToMatch = useMemo(() => {
    return currentBid + (currentBid * bufferBps) / 100;
  }, [currentBid]);

  return (
    <>
      <div ref={connectButtonRef} className="hidden">
        <Button defaultConnectButton={true} variant="connect" />
      </div>
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 flex flex-col h-[280px] sm:h-[350px] lg:h-[300px]">
        <h2 className="text-sm font-bold text-white md:mb-2">Bidding</h2>
        <div className="flex-grow h-auto flex mb-1 md:mb-10">
          <div className="flex-1 pr-2">
            <p className="text-sm sm:text-base text-white md:mb-2 capitalize">
              Current Bid:{" "}
              {currentBid ? `${currentBid} ${symbol}` : `0 ${symbol}`}
            </p>
            <p className="text-sm sm:text-base text-white md:mb-2">
              Time Left: {hours?.toString().padStart(2, "0")}:
              {minutes?.toString().padStart(2, "0")}:
              {seconds?.toString().padStart(2, "0")}
            </p>
            <p className="text-sm sm:text-base text-white md:mb-2 capitalize">
              Minimum Bid: {minBid} {symbol}
            </p>
          </div>
          <div className="flex-1 pl-2">
            <p className="text-sm sm:text-base text-white md:mb-2 capitalize">
              Bid To Match: {bidToMatch} {symbol}
            </p>
            <p className="text-sm sm:text-base text-white md:mb-2 capitalize">
              Buyout Amount: {buyoutBid} {symbol}
            </p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="h-16 overflow-hidden mb-2">
            {bids.map((bid, index) => (
              <div
                key={bid.id}
                className={`bg-white bg-opacity-20 backdrop-blur-md rounded-md p-2 mb-2 transition-all duration-300`}
                style={{
                  opacity: 1 - index * 0.3,
                }}
              >
                <p className="text-white text-sm capitalize">
                  <span className="font-bold">{bid.bidder}</span> bid{" "}
                  {bid.amount} {symbol}
                </p>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your bid"
            />
            <Button
              classNames="rounded-r-md bg-purple-600 hover:bg-purple-700 text-white px-2"
              actionLabel="Bid"
              onClick={handleBid}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <CongratsModal
        isOpen={isCongratsModalOpen}
        onClose={() => setIsCongratsModalOpen(false)}
        winner={latestWinner!}
        actionLabel="Claim your reward"
        action={handleClaim}
        disabled={isDisabled}
      />
    </>
  );
}


