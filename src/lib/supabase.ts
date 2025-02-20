import { createClient } from '@supabase/supabase-js';

<<<<<<< HEAD
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_KEY!);
=======
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
>>>>>>> d470055102717ed90eda86cafea5a0c92d474de8

// Fetch Orders from Supabase
export async function fetchOrders() {
	try {
		const { data, error } = await supabase.from('orders').select();
		if (error) throw error;
		return data;
	} catch (error) {
		console.error('Error fetching orders:', error);
		return [];
	}
}

// Fetch Products from Supabase
export async function fetchProducts() {
	try {
		const { data, error } = await supabase.from('products').select();
		if (error) throw error;
		return data;
	} catch (error) {
		console.error('Error fetching products:', error);
		return [];
	}
}

// Fetch Users from Supabase
export async function fetchUsers() {
	try {
		const { data, error } = await supabase.from('users').select();
		if (error) throw error;
		return data;
	} catch (error) {
		console.error('Error fetching users:', error);
		return [];
	}
}
