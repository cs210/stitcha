import { SupabaseClient } from '@supabase/supabase-js';
import { Product } from '../schemas/global.types';
import { deleteProductFiles, uploadProductImages, uploadTechnicalSheet } from './supabase';

// Convert empty strings to null
function emptyToNull(value: any) {
	if (value === '') return null;

	return value;
};

// Get a product by id
export async function getProduct(id: string, supabase: SupabaseClient) {
	const { data, error }: { data: any; error: any } = await supabase
		.from('products')
		.select(
			`
			*,
			products_users (
				users!inner (*),
				units_completed,
				validated
			),
			products_labor (
				*,
				labor (*)
			),
			products_packaging_materials (
				*,
				packaging_materials (*)
			),
			products_raw_materials (
				*,
				raw_materials (*)
			),
			costs (*)
		`
		)
		.eq('id', id)
		.single();

	const { data: progressData, error: progressError } = await supabase.from('progress').select('*').eq('product_id', id);

	if (progressError) {
		throw new Error(progressError.message);
	}

	// Rename the users, costs, progress, labor, packaging materials, and raw materials fields in the data object
	if (data) {
		data.users = data.products_users.map((product_user: any) => ({
			...product_user.users,
			validated: product_user.validated,
			units_completed: product_user.units_completed,
		}));
		data.labor = data.products_labor;
		data.packaging_materials = data.products_packaging_materials;
		data.raw_materials = data.products_raw_materials;
		data.progress = progressData;

		delete data.products_users;
		delete data.products_labor;
		delete data.products_packaging_materials;
		delete data.products_raw_materials;
	}

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

// Handle deleting a product
export async function deleteProduct(supabase: SupabaseClient, id: string): Promise<void> {
	try {
		// 1. Delete all files from storage
		await deleteProductFiles(supabase, id);

		// 2. Delete the product record
		const { error: deleteError } = await supabase.from('products').delete().eq('id', id);

		if (deleteError) {
			throw new Error(`Failed to delete product: ${deleteError.message}`);
		}
	} catch (error) {
		throw new Error(`Failed to delete product: ${error instanceof Error ? error.message : String(error)}`);
	}
}

// Insert the product costs into the product_costs table
export async function insertProductCost(productId: string, supabase: SupabaseClient, formData: FormData) {
	const productCosts: any = {
		raw_material_cost: JSON.parse(formData.get('raw_material_cost') as string),
		packaging_material_cost: JSON.parse(formData.get('packaging_cost') as string),
		total_material_cost: JSON.parse(formData.get('total_material_cost') as string),
		total_labor_cost: JSON.parse(formData.get('total_labor_cost') as string),
		general_expenses: JSON.parse(formData.get('general_expenses') as string),
		royalties: JSON.parse(formData.get('royalties') as string),
		total_cost: JSON.parse(formData.get('total_cost') as string),
		selling_price: JSON.parse(formData.get('selling_price') as string),
		margin: JSON.parse(formData.get('margin') as string),
	};

	// Insert the product costs into the product_costs table
	const { data: productCostsData, error: productCostsError } = await supabase
		.from('costs')
		.upsert({
			raw_material_cost: productCosts.raw_material_cost,
			packaging_cost: productCosts.packaging_material_cost,
			total_material_cost: productCosts.total_material_cost,
			total_labor_cost: productCosts.total_labor_cost,
			general_expenses: productCosts.general_expenses,
			royalties: productCosts.royalties,
			total_cost: productCosts.total_cost,
			selling_price: productCosts.selling_price,
			margin: productCosts.margin,
			product_id: productId,
		}, {
			onConflict: 'product_id',
		})
		.select()
		.single();

	if (productCostsError) {
		throw new Error(`Failed to insert product costs: ${productCostsError.message}`);
	}

	return productCostsData.id;
}

export async function upsertProduct(formData: FormData, supabase: SupabaseClient, productId: string) {
	const productData: any = {
		name: JSON.parse(formData.get('name') as string),
		system_code: JSON.parse(formData.get('system_code') as string),
		inmetro_cert_number: JSON.parse((formData.get('inmetro_cert_number') as string)?.trim() || 'null'),
		barcode: JSON.parse((formData.get('barcode') as string)?.trim() || 'null'),
		description: JSON.parse((formData.get('description') as string)?.trim() || 'null'),
		weight: JSON.parse(formData.get('weight') as string),
		width: JSON.parse(formData.get('width') as string),
		height: JSON.parse(formData.get('height') as string),
		percent_pieces_lost: JSON.parse(formData.get('percent_pieces_lost') as string),
		product_type: JSON.parse((formData.get('product_type') as string)?.trim() || 'null'),
		progress_level: JSON.parse(formData.get('status') as string),
		total_units: JSON.parse(formData.get('total_units') as string),
	};

	let image_urls: string[] = [];
	let technical_sheet: string | null = null;

	// Delete existing files before uploading new ones
	await deleteProductFiles(supabase, productId);

	const imageFiles = formData.getAll('image_urls') as File[];

	try {
		image_urls = await uploadProductImages(supabase, productId, imageFiles);
	} catch (error: any) {
		throw new Error(`Failed to process product images: ${error.message}`);
	}

	const technical_sheet_url = formData.get('technical_sheet') as File;

	try {
		technical_sheet = await uploadTechnicalSheet(supabase, productId, technical_sheet_url);
	} catch (error: any) {
		throw new Error(`Failed to process technical sheet: ${error.message}`);
	}

	// Create the product object with empty string handling
	const product = {
		...productData,
		id: productId,
		system_code: emptyToNull(productData.system_code),
		inmetro_cert_number: emptyToNull(productData.inmetro_cert_number),
		barcode: emptyToNull(productData.barcode),
		description: emptyToNull(productData.description),
		product_type: emptyToNull(productData.product_type),
		image_urls,
		technical_sheet: emptyToNull(technical_sheet),
	};

	const { data: updatedProduct, error: upsertError } = await supabase.from('products').upsert(product, {
		onConflict: 'id',
	}).select().single();

	if (upsertError) {
		throw new Error(`Failed to upsert product: ${upsertError.message}`);
	}

	return updatedProduct;
}

// Insert the product into the product table
export async function insertProduct(formData: FormData, supabase: SupabaseClient) {
	const productData: any = {
		name: JSON.parse(formData.get('name') as string),
		system_code: JSON.parse(formData.get('system_code') as string),
		inmetro_cert_number: JSON.parse((formData.get('inmetro_cert_number') as string)?.trim() || 'null'),
		barcode: JSON.parse((formData.get('barcode') as string)?.trim() || 'null'),
		description: JSON.parse((formData.get('description') as string)?.trim() || 'null'),
		weight: JSON.parse(formData.get('weight') as string),
		width: JSON.parse(formData.get('width') as string),
		height: JSON.parse(formData.get('height') as string),
		percent_pieces_lost: JSON.parse(formData.get('percent_pieces_lost') as string),
		product_type: JSON.parse((formData.get('product_type') as string)?.trim() || 'null'),
		progress_level: JSON.parse(formData.get('status') as string),
		total_units: JSON.parse(formData.get('total_units') as string),
	};

	let image_urls: string[] = [];
	let technical_sheet: string | null = null;

	// Create the product object with empty string handling
	const product = {
		...productData,
		system_code: emptyToNull(productData.system_code),
		inmetro_cert_number: emptyToNull(productData.inmetro_cert_number),
		barcode: emptyToNull(productData.barcode),
		description: emptyToNull(productData.description),
		product_type: emptyToNull(productData.product_type),
		image_urls,
		technical_sheet: emptyToNull(technical_sheet),
	};

	// Insert the product
	// First, check if a product with the same system_code exists
	const { data: existingProduct } = await supabase.from('products').select('id').eq('system_code', product.system_code).maybeSingle();

	// If it exists, throw an error that can be caught to show a toast message
	if (existingProduct) {
		const err = new Error(`A product with code ${product.system_code} already exists. Please delete it first.`);
		err.name = 'DuplicateProductError';
		throw err;
	}

	// Now insert the new product
	const { data: insertedProduct, error: insertError } = await supabase.from('products').insert(product).select().single();

	if (insertError) {
		throw new Error(`Failed to insert product: ${insertError.message}`);
	}

	const productId = insertedProduct.id;
	const imageFiles = formData.getAll('image_urls') as File[];

	try {
		image_urls = await uploadProductImages(supabase, productId, imageFiles);

	} catch (error: any) {

		throw new Error(`Failed to process product images: ${error.message}`);
	}

	// Update the product with the image URLs
	const { error: updateError } = await supabase.from('products').update({ image_urls }).eq('id', productId).select().single();

	// if image update fails
	if (updateError) {
		throw new Error(`Failed to update product with image urls: ${updateError.message}`);
	}


	const technical_sheet_url = formData.get('technical_sheet') as File;

	try {
		technical_sheet = await uploadTechnicalSheet(supabase, productId, technical_sheet_url);
	} catch (error: any) {
		throw new Error(`Failed to process technical sheet: ${error.message}`);
	}

	// Update the product with the technical sheet URL
	const { data: productWithTechnicalSheet, error: insertErrorTechnicalSheet } = await supabase
		.from('products')
		.update({ technical_sheet })
		.eq('id', productId)
		.select()
		.single();

	if (insertErrorTechnicalSheet) {
		throw new Error(`Failed to insert technical sheet record: ${insertErrorTechnicalSheet.message}`);
	}

	return productWithTechnicalSheet;

}

// Update the labor from the product
export async function updateLaborFromProduct(productId: string, supabase: SupabaseClient, formData: FormData) {
	const labors = JSON.parse(formData.get('labor') as string) as any[];

	if (!labors || labors.length === 0) {
		return;
	}

	for (const labor of labors) {
		const task_insert = {
			task: labor.task,
			cost_per_minute: labor.cost_per_minute,
		};

		const { data: insertedTask, error: upsertError } = await supabase
			.from('labor')
			.upsert(task_insert, {
				onConflict: 'task',  // assumes 'task' is unique
			})
			.select()
			.single();

		if (upsertError) {
			throw new Error(`Failed to insert or update labor type: ${upsertError.message}`);
		}

		const { error: insertError2 } = await supabase.from('products_labor').insert({
			product_id: productId,
			task_id: insertedTask.id,
			time_per_unit: labor.time_per_unit,
			conversion: labor.conversion,
			rework: labor.rework,
			total_cost: labor.total_cost,
		});

		if (insertError2) {
			throw new Error(`Failed to insert or update labor for product ${productId}: ${insertError2.message}`);
		}
	}
}

// Update the raw material from the product
export async function updateRawMaterialFromProduct(productId: string, supabase: SupabaseClient, formData: FormData) {
	const materials = JSON.parse(formData.get('materials') as string) as any[];

	if (!materials || materials.length === 0) {
		return;
	}

	for (const material of materials) {
		const rawMaterial = {
			code: material.code,
			name: material.name,
			purchase_price: material.purchase_price,
			units: emptyToNull(material.units),
		};
		const { data: existingRawMaterial, error: fetchError } = await supabase
			.from('raw_materials')
			.select()
			.or(`code.eq.${rawMaterial.code},name.eq.${rawMaterial.name}`)
			.single();

		if (fetchError && fetchError.code !== 'PGRST116') {
			// Ignore "No rows found" error
			throw new Error(`Failed to check for existing raw material: ${fetchError.message}`);
		}

		let upsertData;

		if (existingRawMaterial) {
			// Step 2: If a row exists, update it
			upsertData = { ...existingRawMaterial, ...rawMaterial }; // Merge existing and new data
		} else {
			// Step 3: If no row exists, insert as new
			upsertData = rawMaterial;
		}

		// Step 4: Upsert (Insert or Update)
		const { data: insertedRawMaterial, error: insertError1 } = await supabase
			.from('raw_materials')
			.upsert(upsertData, { ignoreDuplicates: false })
			.select()
			.single();

		if (insertError1) {
			throw new Error(`Failed to insert or update raw material: ${insertError1.message}`);
		}
		// Add the raw material to the products_and_raw_materials junction table
		const { error: insertError2 } = await supabase.from('products_raw_materials').insert({
			product_id: productId,
			material_code: insertedRawMaterial.id,
			unit_consumption: material.unit_consumption,
			total_cost: material.total_cost,
		});

		if (insertError2) {
			throw new Error(`Failed to insert or update material for product ${productId}: ${insertError2.message}`);
		}
	}
}

// Update the packaging material from the product
export async function updatePackagingMaterialFromProduct(productId: string, supabase: any, formData: FormData) {
	// Parse the packaging materials from the form data
	const packaging_materials = JSON.parse(formData.get('packaging_materials') as string) as any[];

	if (!packaging_materials || packaging_materials.length === 0) {
		return;
	}

	// Process each packaging material
	for (const packaging_material of packaging_materials) {
		// Step 1: Prepare the packaging material data
		const packagingMaterial = {
			code: packaging_material.code,
			name: packaging_material.name,
			purchase_price: packaging_material.purchase_price,
			units: emptyToNull(packaging_material.units),
		};

		const { data: existingPackagingMaterial, error: fetchError } = await supabase
			.from('packaging_materials')
			.select()
			.or(`code.eq.${packagingMaterial.code},name.eq.${packagingMaterial.name}`)
			.single();

		if (fetchError && fetchError.code !== 'PGRST116') {
			// Ignore "No rows found" error
			throw new Error(`Failed to check for existing packaging material: ${fetchError.message}`);
		}

		let upsertData;
		if (existingPackagingMaterial) {
			// Step 2: If a row exists, update it
			upsertData = { ...existingPackagingMaterial, ...packagingMaterial }; // Merge existing and new data
		} else {
			// Step 3: If no row exists, insert as new
			upsertData = packagingMaterial;
		}

		// Step 4: Upsert (Insert or Update)
		const { data: insertedPackagingMaterial, error: insertError1 } = await supabase
			.from('packaging_materials')
			.upsert(upsertData, { ignoreDuplicates: false })
			.select()
			.single();

		if (insertError1) {
			throw new Error(`Failed to insert or update packaging material: ${insertError1.message}`);
		}

		// Add the packaging material to the products_and_packaging_materials junction table
		const { error: insertError2 } = await supabase.from('products_packaging_materials').insert({
			product_id: productId,
			material_code: insertedPackagingMaterial.id,
			unit_consumption: packaging_material.unit_consumption,
			total_cost: packaging_material.total_cost,
		});

		if (insertError2) {
			throw new Error(`Failed to insert or update packaging material for product ${productId}: ${insertError2.message}`);
		}
	}
}

// Remove a seamstress from a product
export async function removeSeamstressFromProduct(product: Product, seamstressId: string, setAssignedSeamstresses: any) {
	try {
		const response = await fetch(`/api/products/${product.id}/seamstresses/${seamstressId}`, {
			method: 'DELETE',
		});
		const { data, error } = await response.json();

		if (error) {
			throw new Error(error.message);
		}

		setAssignedSeamstresses(data);
	} catch (error) {
		throw new Error(error.message);
	}
}

/**
 * Deletes all related records for a product from junction tables
 * @param productId - The ID of the product to delete related records for
 * @throws Error if deletion fails
 */
export async function deleteProductRelations(productId: string, supabase: any) {
	try {
		// Delete from products_labor
		const { error: laborError } = await supabase
			.from('products_labor')
			.delete()
			.eq('product_id', productId);

		if (laborError) {
			throw new Error(`Failed to delete labor records: ${laborError.message}`);
		}

		// Delete from products_packaging_materials
		const { error: packagingError } = await supabase
			.from('products_packaging_materials')
			.delete()
			.eq('product_id', productId);

		if (packagingError) {
			throw new Error(`Failed to delete packaging material records: ${packagingError.message}`);
		}

		// Delete from products_raw_materials
		const { error: rawMaterialsError } = await supabase
			.from('products_raw_materials')
			.delete()
			.eq('product_id', productId);

		if (rawMaterialsError) {
			throw new Error(`Failed to delete raw material records: ${rawMaterialsError.message}`);
		}
	} catch (error) {
		throw new Error(`Failed to delete product relations: ${error.message}`);
	}
}
