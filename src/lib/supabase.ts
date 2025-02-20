import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

// Fetch Orders from Supabase
export async function fetchOrders() {
  try {
    const { data, error } = await supabase.from("orders").select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

// Fetch Products from Supabase
export async function fetchProducts() {
  try {
    const { data, error } = await supabase.from("products").select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
