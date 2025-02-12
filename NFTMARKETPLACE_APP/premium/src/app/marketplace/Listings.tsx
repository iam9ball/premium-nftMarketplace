'use client'
import { useEffect, useCallback, useState, useMemo, use } from "react";
import Card from "../components/card/Card";
import { client } from "../client";
import { fetchNFT, listings } from "../contracts/listingInfo";
import { ipfsToHttp } from "../utils/ipfsToHttp";
import useCreateListingModal from "../hooks/useCreateListingModal";
import EmptyState from "../components/EmptyState";
import Error from "../components/Error";
import { CardContainer } from "../components/card/CardContainer";
import CardSkeletonContainer from "../components/card/CardSkeleton";
import { tokenInfo } from "../hooks/useCurrency";
import { useRouter, useSearchParams } from "next/navigation";
import { toEther } from "thirdweb/utils";
import { Contract } from "../utils/Contract";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import useInfiniteScrollMutateStore from "@/app/hooks/useInfiniteScrollMutateStore";
import Container from "../components/Container";
import { showToast } from "../components/WalletToast";
import { algoliasearch } from "algoliasearch";
import { useSearchStore } from "@/app/hooks/useSearch";
import { updateAlgoliaIndex } from "../actions/algoliaIndexing";

// Initialize Algolia search client
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

const indexName = "nft_listings";

export default function Listings() {
  const createListingModal = useCreateListingModal();
  const { setMutateListings } = useInfiniteScrollMutateStore();
  const router = useRouter();
  const PAGE_SIZE = 8;
  const [initialLoading, setInitialLoading] = useState(true);
  const searchParams = useSearchParams();
  const { searchQuery } = useSearchStore();
  const [searchResults, setSearchResults] = useState<any[]>([]); // Store search results
  const LimitedListings = async (start = 0, limit: null | number = null) => {
    try {
      const allListings = await listings();
      if (!allListings || allListings.length === 0) {
        return [];
      }
      const reversedListings = [...allListings].reverse();

      if (limit !== null) {
        return reversedListings.slice(start, start + limit);
      }

      return reversedListings;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  };

  const handleCardClick = (params: bigint) => {
    router.push(`/marketplace/listing/${params}`);
  };

  // Function to fetch Algolia search results
  const fetchSearchResults = useCallback(async () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await searchClient.searchSingleIndex({
        indexName,
        searchParams: {
          query: searchQuery,
          hitsPerPage: PAGE_SIZE,
        },
      });

      setSearchResults(response.hits);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }, [searchQuery]);

  // Fetch search results when searchQuery changes
  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, fetchSearchResults]);

  const fetchListings = useCallback(
    async (key: string) => {
      if (searchQuery) return { items: [], totalCount: 0 }; // Disable infinite scroll during search

      try {
        const pageIndex =
          parseInt(key.split("-page-")[1]?.split("-")[0], 10) || 0;
        const start = pageIndex * PAGE_SIZE;

        const pageListings = await LimitedListings(start, PAGE_SIZE);

        if (!Array.isArray(pageListings)) {
          return { items: [], totalCount: 0 };
        }

        const results = await Promise.allSettled(
          pageListings.map(async (listing) => {
            try {
              const contract = Contract(listing.assetContract);
              const nft = await fetchNFT(
                contract,
                listing.tokenType,
                listing.tokenId
              );
              const currency = await tokenInfo(listing.currency);

              if (!nft?.metadata) {
                console.error(
                  "Missing NFT metadata for listing:",
                  listing.listingId
                );
                return null;
              }

              return (
                <Card
                  key={listing?.listingId?.toString()}
                  alt={nft.metadata.name || "NFT"}
                  id={listing?.tokenId?.toString()}
                  src={ipfsToHttp(nft.metadata.image || "")}
                  price={toEther(listing.pricePerToken)}
                  listingId={listing.listingId}
                  name={nft.metadata.name || "NFT"}
                  currency={currency?.symbol!}
                  status={listing.status}
                  variant="primary"
                  onClick={() => handleCardClick(listing.listingId)}
                />
              );
            } catch (error) {
              console.error(
                "Error fetching listing:",
                listing.listingId,
                error
              );
              throw error;
            }
          })
        );

        const fulfilledResults = results
          .filter((result) => result.status === "fulfilled")
          .map(
            (result) => (result as PromiseFulfilledResult<JSX.Element>).value
          );

        return {
          items: fulfilledResults.filter(Boolean),
          totalCount: pageListings.length,
        };
      } catch (error) {
        console.error("Error fetching listings:", error);
        throw error;
      }
    },
    [searchQuery]
  );

  const getTotalCount = useCallback(async () => {
    try {
      const totalListings = await listings();
      return totalListings?.length;
    } catch (error) {
      console.error("Error fetching total count:", error);
      throw error;
    }
  }, []);

  const { ref, pages, isLoading, error, mutate } = useInfiniteScroll({
    fetchData: fetchListings,
    initialTotalCount: undefined,
    revalidateKey: "listings",
    getTotalCount,
  });

  useEffect(() => {
    setMutateListings("marketplaceMutate", mutate);
    setInitialLoading(false);
  }, [mutate]);

  useEffect(() => {
    if (searchParams.get("redirected")) {
      showToast("Please log in", "Connect your wallet to login.");
    }
  }, []);

  console.log("error", error);
  

   // Determine what to render: search results or default listings
  const allItems = searchQuery
    ? searchResults.map((listing) => (
        <Card
          key={listing?.listingId?.toString()}
          alt={listing.nftName}
          id={listing?.tokenId?.toString()}
          src={listing.nftImage}
          price={listing.price}
          listingId={listing.listingId}
          name={listing.nftName}
          currency={listing.currencySymbol}
          status={listing.status}
          variant="primary"
          onClick={() => handleCardClick(listing.listingId)}
        />
      ))
    : pages?.flatMap((page) => page?.items || []);

    if (error) return <Error error={error} />;

    if (initialLoading || (!pages && !error)) {
      return (
        <Container>
          <CardContainer>
            <CardSkeletonContainer />
          </CardContainer>
        </Container>
      );
    }
  if (!initialLoading && allItems?.length === 0 && !error) {
    return (
      <EmptyState
        title="Oops!"
        subtitle="No listing at the moment. Try creating one"
        label="Create listing"
        showButton
        onClick={createListingModal.onOpen}
      />
    );
  }

  return (
    <Container>
      <CardContainer>{allItems}</CardContainer>
      <div ref={ref} className="h-full mb-auto mt-5 w-full">
        {isLoading && (
          <CardContainer>
            <CardSkeletonContainer />
          </CardContainer>
        )}
      </div>
    </Container>
  );
}