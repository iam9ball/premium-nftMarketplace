import {create} from "zustand";

interface UpdateListingPlanModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    listingId: bigint | null;
    setListingId: (id: bigint) => void;
 
   
}

const useUpdateListingPlanModal = create<UpdateListingPlanModalStore>((set) => ({
  isOpen: false,
  listingId: null,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
 setListingId: (id) => set({listingId: id}),

}));

export default useUpdateListingPlanModal;
