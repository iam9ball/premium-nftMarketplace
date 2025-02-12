"use client";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import { useRouter } from "next/navigation";

interface AuctionItemProps {
  id: number;
  name: string;
  currentBid: any;
  endTime: string;
  currency: string;
}

export function AuctionItem({
  id,
  name,
  currentBid,
  endTime,
  currency,
}: AuctionItemProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const router = useRouter();

  function calculateTimeLeft() {
    const difference = +endTime - Math.floor(+new Date() / 1000);
    if (difference > 0) {
      return {
        hours: Math.floor((difference / ( 60 * 60)) % 24),
        minutes: Math.floor((difference /  60) % 60),
        seconds: Math.floor(difference  % 60),
      };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]); // Added calculateTimeLeft to dependencies

  const { hours, minutes, seconds } = timeLeft;

  return (
    <div className="bg-white rounded-lg shadow p-4  flex justify-evenly items-center space-x-4 min-w-[300px]">
      <div className="flex-grow">
        <h3 className="font-semibold text-lg capitalize">{name}</h3>
        <p className="text-sm text-gray-600 capitalize">
          Current Bid: {currentBid} {currency}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">Ends in:</p>
        <p className="text-xs font-mono">
          {hours?.toString().padStart(2, "0")}:
          {minutes?.toString().padStart(2, "0")}:
          {seconds?.toString().padStart(2, "0")}
        </p>
      </div>
      <Button
        classNames="bg-green-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600 transition-colors duration-300"
        actionLabel="Join Now"
        onClick={() => {router.push(`/auction/${id?.toString()}`)}}
      />
    </div>
  );
}
