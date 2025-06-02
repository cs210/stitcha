import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';
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
	} catch (error: any) {
		throw new Error(error.message);
	}
}

// Create a new progress update for a seamstress
export async function createProgressUpdate(seamstressId: string, supabase: SupabaseClient, formData: FormData) {
	try {
		const imageFiles = formData.getAll('image_urls') as File[];
		const imageUrls: string[] = [];

		if (imageFiles && imageFiles.length > 0) {
			for (const file of imageFiles) {
				const fileExt = file.name.split('.').pop();
				const fileName = `${uuidv4()}.${fileExt}`;
				const filePath = `${formData.get('product')}/progress/${seamstressId}/${fileName}`;

				const arrayBuffer = await file.arrayBuffer();
				const fileBuffer = new Uint8Array(arrayBuffer);

				const { error } = await supabase.storage.from('products').upload(filePath, fileBuffer, {
					contentType: file.type,
					upsert: false,
				});

				if (error) {
					throw new Error(`Error uploading file: ${error.message}`);
				}

				const { data } = await supabase.storage.from('products').createSignedUrl(filePath, 60 * 60 * 24 * 365);

				imageUrls.push(data?.signedUrl || '');
			}
		}

		const { data, error } = await supabase.from('progress').insert({
			user_id: seamstressId,
			product_id: formData.get('product'),
			description: formData.get('description'),
			emotion: formData.get('emotion'),
			units_completed: formData.get('units_completed'),
			image_urls: imageUrls,
		});

		if (error) {
			throw new Error(error.message);
		}

		return data;
	} catch (error: any) {
		throw new Error(error.message);
	}
}