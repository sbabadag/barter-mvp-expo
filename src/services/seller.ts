import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

export type SellerInfo = {
  id: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  avatar_url?: string;
};

export const useSellerInfo = (sellerId: string | undefined) => useQuery({
  queryKey: ["seller", sellerId],
  queryFn: async () => {
    if (!sellerId) return null;
    
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        display_name,
        first_name,
        last_name,
        city,
        avatar_url
      `)
      .eq("id", sellerId)
      .single();
    
    if (error) throw error;
    return data as SellerInfo;
  },
  enabled: !!sellerId
});
