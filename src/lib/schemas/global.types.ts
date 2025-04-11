import { Tables } from '@/lib/types/supabase';

// These are not dynamically generated and will need to be updated manually if any changes are made to the database
export type LaborType = Tables<'labor_types'>;
export type Order = Tables<'orders'>;
export type PackagingMaterial = Tables<'packaging_materials'>;
export type ProductCost = Tables<'product_costs'>;
export type Product = Tables<'products'> & {
	image_urls?: string[];
};
export type ProductAndLabor = Tables<'products_and_labor'>;
export type ProductAndPackagingMaterial = Tables<'products_and_packaging_materials'>;
export type ProductAndRawMaterial = Tables<'products_and_raw_materials'>;
export type Progress = Tables<'progress'>;
export type RawMaterial = Tables<'raw_materials'>;
export type User = Tables<'users'>;
