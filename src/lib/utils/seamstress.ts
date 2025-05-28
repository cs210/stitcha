import { SupabaseClient } from "@supabase/supabase-js";
import { Product } from "../schemas/global.types";

// Get a seamstress
export async function getSeamstress(id: string, supabase: SupabaseClient) {
	try {
		const { data: seamstressData, error: seamstressError } = await supabase
			.from('users')
			.select(`
				*,
				products_users (
					*,
					products (*)
				)
			`)
			.eq('id', id)
			.eq('role', 'seamstress')
			.single();

		if (seamstressError) {
			throw new Error(seamstressError.message);
		}

		const { data: progressData, error: progressError } = await supabase.from('progress').select('*').eq('user_id', id);

		if (progressError) {
			throw new Error(progressError.message);
		}

		const data = { ...seamstressData };

		if (data) {
			// Map product_user records (including product data) to products field
			data.products = data.products_users.map((product: Product) => ({
				...product.products,
				validated: product.validated,
				units_completed: product.units_completed || 0,
				units_assigned: product.units_assigned || 0,
			}));

			// Update each product with respective progress data
			if (progressData && data.products) {
				data.products = data.products.map((product: Product) => {
					const productProgress = progressData.filter((progress) => progress.product_id === product.id);

					return {
						...product,
						progress: productProgress || [],
					};
				});
			}

			// Calculate total units completed across all products
			data.total_units_completed = data.products_users.reduce((total: number, product: Product) => {
				return total + (product.units_completed || 0);
			}, 0);

			// Calculate total units assigned across all products
			data.total_units_assigned = data.products_users.reduce((total: number, product: Product) => {
				return total + (product.units_assigned || 0);
			}, 0);

			delete data.products_users;
		}

		return data;
	} catch (error) {
		throw new Error(error.message);
	}
}