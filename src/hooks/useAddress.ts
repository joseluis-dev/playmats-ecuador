import { useAddressStore } from "@/stores/addressStore";

export const useAddress = () => {
  const { addresses, selected, setCurrent, loading, loadAddresses, addAddress, updateAddress, deleteAddress, error } = useAddressStore();

  return { addresses, selected, setCurrent, loading, loadAddresses, addAddress, updateAddress, deleteAddress, error };
};