"use client";
import useCreateAuctionModal from "@/app/hooks/useCreateAuctionModal";
import Modal from "./Modal";
import { useCallback, useMemo, useState, useEffect } from "react";
import Heading from "../Heading";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import { createAuction } from "@/app/contracts/auction";
import { useActiveAccount } from "thirdweb/react";
import CurrencySelect, { CurrencySelectValue } from "../CurrencySelect";
import toast from "react-hot-toast";
import { showToast } from "../WalletToast";
import { useRouter } from "next/navigation";
import { NATIVE_TOKEN } from "@/app/utils/address";
import TimeRangePicker, { RangePickerProps } from "../TimeRangePicker";

enum STEPS {
  INFO,
  DURATION,
}

const CreateListingModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const createAuctionModal = useCreateAuctionModal();
  const account = useActiveAccount();
  const [step, setStep] = useState(STEPS.INFO);
  const [selectedValue, setSelectedValue] = useState<CurrencySelectValue>();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      assetAddress: "",
      assetId: null,
      assetPrice: null,
      currencyAddress: NATIVE_TOKEN,
      bidBufferBps: null,
      minimumBidAmount: null,
      buyoutBidAmount: null,
      startTimestamp: null,
      endTimestamp: null,
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const [timeValue, setTimeValue] = useState<RangePickerProps["value"]>(null);

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.DURATION) {
      return onNext();
    }
    const startTimeStamp = data.startTimestamp / 1000;
    const endTimeStamp = data.endTimestamp / 1000;
   
    if (account) {
      if (!data.currencyAddress) {
        toast.error("Please select a currency");
        return;
      }

      setIsLoading(true);
      
      try {
        await createAuction(
          data.assetAddress,
          data.assetId,
          data.currencyAddress,
          data.minimumBidAmount,
          data.buyoutBidAmount,
          BigInt(data.bidBufferBps),
          BigInt(startTimeStamp),
          BigInt(endTimeStamp),
          account
        ).then(async(data) => {
         
          if (data.success) {
            createAuctionModal.onClose();
            toast.success(data.message);
            reset();
            setSelectedValue(undefined);
            onTimeChange([null, null]);
            // createAuctionModal.mutateListings(); // force a soft refetching of listing

           
          } else {
            toast.error(data.message);
          }
          
        });
      } catch (error: any) {
        toast.error(error.message);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      createAuctionModal.onClose();
      showToast();
    }
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const forwardLabel = useMemo(() => {
    if (step === STEPS.DURATION) {
      return "Submit";
    } else {
      return "Next";
    }
  }, [step]);

  const backwardLabel = useMemo(() => {
    if (step === STEPS.INFO) {
      return undefined;
    }
    return "Back";
  }, [step]);

  const setCustomValues = useCallback(
    (key: any, value: any) => {
      setValue(key, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  const handleCurrencySelect = (selectedOption: CurrencySelectValue | null) => {
    if (selectedOption) {
      // Set the currency field value to the entire selected option
      setSelectedValue(selectedOption);

      // Set the currency address field value
      setCustomValues("currencyAddress", selectedOption.address);
      console.log(selectedOption.address);
    } else {
      // Clear the values if no option is selected
      setSelectedValue(undefined);
      setCustomValues("currencyAddress", undefined);
    }
  };

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

  let bodyContent;

  {
    step == STEPS.INFO &&
      (bodyContent = (
        <>
          <div className="flex flex-col  gap-7">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col ">
                <label
                  htmlFor="assetContract"
                  className="block text-xs md:text-sm font-medium text-gray-700"
                >
                  Asset address
                </label>
                <input
                  type="text"
                  id="assetContract"
                  className={`${
                    errors.assetAddress ? "border-red-500" : "border-gray-300"
                  } mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[13px]`}
                  {...register("assetAddress", {
                    required: true,
                  })}
                  placeholder="0x123...789"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="assetId"
                    className="block text-xs md:text-sm font-medium text-gray-700"
                  >
                    Token ID
                  </label>
                  <input
                    type="number"
                    id="assetId"
                    {...register("assetId", {
                      required: true,
                    })}
                    className={`${
                      errors.assetId ? "border-red-500" : "border-gray-300"
                    } mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    placeholder="0"
                  />
                </div>

                <div className="flex-1 relative">
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
                    } mt-1 p-2 pl-6  w-full rounded-md border  shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    {...register("bidBufferBps", {
                      required: true,
                      min: 0,
                      max: 100,
                    })}
                    placeholder="10"
                  />
                  <div className="absolute left-2 top-1/2">%</div>
                </div>
              </div>

              <div className="flex gap-4">
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
                      errors.minimumBidAmount
                        ? "border-red-500"
                        : "border-gray-300"
                    } mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    placeholder="0"
                  />
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="buyoutBidAmount"
                    className="block text-xs md:text-sm font-medium text-gray-700"
                  >
                    Buyout bid amount
                  </label>
                  <input
                    type="number"
                    id="buyoutBidAmount"
                    {...register("buyoutBidAmount", {
                      required: true,
                    })}
                    className={`${
                      errors.buyoutBidAmount
                        ? "border-red-500"
                        : "border-gray-300"
                    } mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    placeholder="0"
                  />
                </div>
              </div>

              <CurrencySelect
                value={selectedValue}
                onChange={handleCurrencySelect}
              />
              <div className="text-xs  text-slate-600 break-words">
                **Bid buffer bps: The percentage a bidder must match to the
                existing winning bid. The Bid buffer bps would be a percentage
                of the minimum bid amount. Max is 100%**{" "}
              </div>
            </div>
          </div>
        </>
      ));
  }

  {
    step == STEPS.DURATION &&
      (bodyContent = (
        <div className="w-full flex-col gap-7 justify-center">
          <div className="md:text-[12px] text-[10px]  text-gray-500 break-words">
            **Select the duration in which your auction would start and stop.
            The start time must begin 30 minutes from now and the duration must
            not be more than 1hr 30min**
          </div>
          <div className="w-[90%] mt-3 flex justify-center ">
            <TimeRangePicker onChange={onTimeChange} value={timeValue} />
          </div>
        </div>
      ));
  }

  return (
    <Modal
      isOpen={createAuctionModal.isOpen}
      onClose={createAuctionModal.onClose}
      forward={handleSubmit(onSubmit)}
      forwardLabel={forwardLabel}
      backwardLabel={backwardLabel}
      backward={onBack}
      title="Create an Auction"
      body={bodyContent}
      disabled={isLoading}
    />
  );
};

export default CreateListingModal;
