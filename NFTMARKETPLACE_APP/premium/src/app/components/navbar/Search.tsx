"use client";

import { BiSearch } from "react-icons/bi";
import { useSearchStore } from "@/app/hooks/useSearch";
import { useState } from "react";


export default function Search() {
  const [inputValue, setInputValue] = useState("");
  const { setSearchQuery } = useSearchStore();


  const handleSearch = () => {
    setSearchQuery(inputValue); // Save the search query to Zustand
  };
  return (
    <div className="border-[1px] z-10 border-[#8F9092] w-[250px] sm:w-[480px] md:w-[420px] lg:w-[500px] py-[3px] bg-gradient-to-b from-[#D8D9DB] via-slate-300 to-[#fff] md:py-2 px-3 rounded-full shadow-xl hover:border-[1px] hover:z-20 hover:shadow-2xl transition cursor-pointer">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(); // Trigger search on Enter key
            }
          }}
          className="w-full outline-none text-xs md:text-sm pl-1 ring-0 focus:ring-0 text-center rounded-full text-[#606060] border-transparent hover:border-[1px] hover:border-rose-500 focus:border-[1px] focus:border-rose-500 transition-colors font-inter placeholder:text-gray-500 placeholder:font-light"
        />
        <div className="p-1 bg-rose-500 rounded-full text-white hover:bg-white hover:text-rose-500 hover:border-rose-500">
          <BiSearch size={15} onClick={handleSearch} />
        </div>
      </div>
    </div>
  );
}



