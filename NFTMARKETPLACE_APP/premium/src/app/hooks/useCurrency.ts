import { useMemo, useCallback, useEffect, useState } from 'react';
import { readContract, ZERO_ADDRESS } from 'thirdweb';
import useSWR from 'swr';
import { marketContract } from '../constant';
import { NATIVE_TOKEN } from '../utils/address';

export interface TokenInfo {
  value: string;
  symbol: string;
  image: {
    thumb: string;
  };
  address: string;
}

const DAI_ADDR = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
 export const tokenInfo = (addr:string):TokenInfo | undefined => {
 
   if (addr.toLowerCase() === NATIVE_TOKEN.toLowerCase()) {
    return {
    value: "matic-network",
    symbol: "MATIC",
    image: {
      thumb: "/tokens/matic.png",
    },
    address: NATIVE_TOKEN
  }
   }

   else {
    if (addr.toLowerCase() === DAI_ADDR.toLowerCase()){
      return {
    value: "dai-network",
    symbol: "DAI",
    image: {
      thumb: "/tokens/dai.png",
    },
    address: DAI_ADDR
  }
    }
   }
  
};








export const useCurrency = () => {


  const fetchCurrencyAddresses = useCallback(async () => {
      try {
        const datas = await readContract({
          contract: marketContract,
          method: "getAllCurrency"
        });
        const filteredCurrencyAddress = datas.filter(addr => addr !== ZERO_ADDRESS);
        const response = await Promise.all(filteredCurrencyAddress.map((addr) => tokenInfo(addr)));
        return response;

      } catch (error) {
        console.error("Failed to fetch currency addresses:", error);
        throw error
      }
    }, []);

    

 

  

  const { data, error, isLoading } = useSWR("currency", fetchCurrencyAddresses, {
    revalidateOnReconnect: true,
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateIfStale: false
  });
  const currency = useMemo(() => {
    if (!data) return [];
    return data?.map((token) => ({
    value: token?.value,
    symbol: token?.symbol,
    image: token?.image,
    address: token?.address
  }));
  }, [data])
  


  return {
    currency,
    error,
    isLoading
  };
};

