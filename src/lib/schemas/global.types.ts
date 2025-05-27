import { Database, Tables } from '@/lib/types/supabase';

// These are not dynamically generated and will need to be updated manually if any changes are made to the database
export type Cost = Tables<'costs'>;
export type Education = Tables<'education'>;
export type Labor = Tables<'labor'>;
export type PackagingMaterial = Tables<'packaging_materials'>;
export type Product = Tables<'products'>;
export type ProductLabor = Tables<'products_labor'>;
export type ProductPackagingMaterial = Tables<'products_packaging_materials'>;
export type ProductRawMaterial = Tables<'products_raw_materials'>;
export type Progress = Tables<'progress'>;
export type RawMaterial = Tables<'raw_materials'>;
export type User = Tables<'users'>;

export type ProgressLevel = Database['public']['Enums']['progress_level'];