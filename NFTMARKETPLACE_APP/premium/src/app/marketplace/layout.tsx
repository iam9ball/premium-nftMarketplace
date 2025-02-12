import type { Metadata } from "next";
import NavBar from "../components/navbar/NavBar";
import { Suspense } from "react";









export const metadata: Metadata = {
  title: "Premium marketplace",
  description: "A NFT marketplace where you can collect, sell and create NFTs",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
       <Suspense>  
      <header>
      <NavBar/>
     </header>
     { children}
     </Suspense>
  );
}
