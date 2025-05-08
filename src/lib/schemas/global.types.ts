import { Database, Tables } from '@/lib/types/supabase';

// These are not dynamically generated and will need to be updated manually if any changes are made to the database
export type Labor = Tables<'labor'>;
export type PackagingMaterial = Tables<'packaging_materials'>;
export type ProductCost = Tables<'product_costs'>;
export type Product = Tables<'products'>;
export type ProductAndLabor = Tables<'products_labor'>;
export type ProductAndPackagingMaterial = Tables<'products_packaging_materials'>;
export type ProductAndRawMaterial = Tables<'products_raw_materials'>;
export type Progress = Tables<'progress'>;
export type RawMaterial = Tables<'raw_materials'>;
export type TechnicalSheet = Tables<'technical_sheets'>;
export type User = Tables<'users'>;

export type ProgressLevel = Database['public']['Enums']['progress_level'];
