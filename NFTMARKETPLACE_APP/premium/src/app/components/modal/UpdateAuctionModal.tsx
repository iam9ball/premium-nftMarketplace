"use client";

import Modal from "./Modal";
import { useCallback, useEffect, useMemo, useState } from "react";
import useCreateAuctionModal from "@/app/hooks/useCreateAuctionModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import { useActiveAccount } from "thirdweb/react";
import CurrencySelect, { CurrencySelectValue } from "../CurrencySelect";
import toast from "react-hot-toast";
import { showToast } from "../WalletToast";
import { updateAuction } from "@/app/contracts/auction";
import TimeRangePicker, { RangePickerProps } from "../TimeRangePicker";
import { useCurrency } from "@/app/hooks/useCurrency";
import { NATIVE_TOKEN } from "@/app/utils/address";
import { auctionItem } from "@/app/dashboard/MyAuctions";
import useInfiniteScrollMutateStore from "@/app/hooks/useInfiniteScrollMutateStore";

interface UpdateAuctionModalProps {
  auction: auctionItem;
  onClose: () => void;
  isOpen: boolean;
  onSuccess: () => void;
}

export default function UpdateAuctionModal({
  auction,
  onClose,
  isOpen,
  onSuccess: closeSideBar,
}: UpdateAuctionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const account = useActiveAccount();
  const [timeValue, setTimeValue] = useState<RangePickerProps["value"]>(null);
  const { currency } = useCurrency();
  const { dashboardRefreshListings } = useInfiniteScrollMutateStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      minimumBidAmount: auction.minimumBidAmount,
      buyOutBidAmount: auction.buyoutBidAmount,
      currency: auction.currency,
      bidBufferBps: auction.bidBufferBps,
      startTimestamp: null,
      endTimestamp: null,
    },
    mode: "onSubmit", // Validate on form submission
    reValidateMode: "onSubmit",
  });

  const currencyAddress = watch("currency");
  const minimumBidAmount = watch("minimumBidAmount");
  const buyOutBidAmount = watch("buyOutBidAmount");
  const bidBufferBps = watch("bidBufferBps");

  // Format the currency options
  const defaultCurrency = useMemo(() => {
    return currency?.find((option) => {
      return option.address == auction.currency;
    });
  }, [currency, auction.currency]);


  // Reset form when auction changes
  useEffect(() => {
     setCustomValues("currency", defaultCurrency);
     setCustomValues("bidBufferBps", Number(auction.bidBufferBps) || 0);
     setCustomValues("minimumBidAmount", auction.minimumBidAmount || 0);
     setCustomValues("buyOutBidAmount", auction.buyoutBidAmount || 0);
   
  }, [auction, defaultCurrency]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {

    let address;
    if (
      data.currency.address ==
      "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"
    ) {
      address = NATIVE_TOKEN;
    } else {
      address = data.currency.address;
    }
    const startTimeStamp = data.startTimestamp / 1000;
    const endTimeStamp = data.endTimestamp / 1000;

    if (account) {
      if (!data.currency) {
        toast.error("Please select a currency");
        return;
      } else if (!startTimeStamp || !endTimeStamp) {
        toast.error("Please select duration");
        return;
      }
      console.log(data.currency);
      setIsLoading(true);
      try {
        await updateAuction(
          auction.auctionId,
          address,
          BigInt(data.minimumBidAmount),
          BigInt(data.buyOutBidAmount),
          BigInt(data.bidBufferBps),
          BigInt(startTimeStamp),
          BigInt(endTimeStamp),
          account
        ).then(async (data) => {
          console.log(data);
          if (data?.success) {
            toast.success(data?.message);
            onClose();
            await dashboardRefreshListings?.();
            closeSideBar();
          } else {
            toast.error(data?.message!);
          }
        });
      } catch (error: any) {
        toast.error(error.message);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClose();
      showToast();
    }
  };

  const setCustomValues = useCallback(
    (key: string, value: any) => {
      setValue(key, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );
  

  const onTimeChange = useCallback(
    (value: RangePickerProps["value"]) => {
      // Update timeValue state
      setTimeValue(value);

      // Set start and end timestamps
      if (value && value[0] && value[1]) {
        setCustomValues("startTimestamp", value[0].valueOf());
        setCustomValues("endTimestamp", value[1].valueOf());
      }
    },
    [setCustomValues]
  );

  let bodyContent = (
    <div className="flex flex-col  gap-7">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className=" relative">
              <label
                htmlFor="bidBufferBps"
                className="block text-xs md:text-sm font-medium text-gray-700"
              >
                Bid buffer bps
              </label>
              <input
                type="number"
                min="0"
                max="100"
                id="bidBufferBps"
                className={`${
                  errors.bidBufferBps ? "border-red-500" : "border-gray-300"
                } border-2 rounded-lg mt-1 p-2 w-full pl-6 placeholder:text-[12px] md:placeholder:text-[13px]`}
                {...register("bidBufferBps", {
                  required: true,
                  min: 0,
                  max: 100,
                })}
                placeholder="10"
                value={bidBufferBps ?? ""}
                onChange={(e) =>
                  setCustomValues("bidBufferBps", e.target.value)
                }
              />
              <div className="absolute left-2 top-1/2">%</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 ">
          <div className="flex-1">
            <label
              htmlFor="buyOutBidAmount"
              className="block text-xs md:text-sm font-medium text-gray-700"
            >
              Buyout bid amount
            </label>
            <input
              type="number"
              id="buyOutBidAmount"
              {...register("buyOutBidAmount", {
                required: true,
              })}
              className={`${
                errors.buyOutBidAmount ? "border-red-500" : "border-gray-300"
              } mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              placeholder="0"
              value={buyOutBidAmount ?? ""}
              onChange={(e) =>
                setCustomValues("buyOutBidAmount", e.target.value)
              }
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="minimumBidAmount"
              className="block text-xs md:text-sm font-medium text-gray-700"
            >
              Minimum bid amount
            </label>
            <input
              type="number"
              id="minimumBidAmount"
              {...register("minimumBidAmount", {
                required: true,
              })}
              className={`${
                errors.minimumBidAmount ? "border-red-500" : "border-gray-300"
              } mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              placeholder="0"
              value={minimumBidAmount ?? ""}
              onChange={(e) =>
                setCustomValues("minimumBidAmount", e.target.value)
              }
            />
          </div>
        </div>

        <CurrencySelect
          value={currencyAddress}
          onChange={(selectedOption) => {
            setCustomValues("currency", selectedOption);
          }}
        />

        <div className="w-[90%] mt-3 flex justify-center ">
          <TimeRangePicker onChange={onTimeChange} value={timeValue} />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Modal
        title="Update auction"
        isOpen={isOpen}
        onClose={onClose}
        forward={handleSubmit(onSubmit)}
        forwardLabel="Submit"
        disabled={isLoading}
        body={bodyContent}
      />
    </div>
  );
}
