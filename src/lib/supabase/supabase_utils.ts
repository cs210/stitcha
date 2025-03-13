import { SupabaseClient } from '@supabase/supabase-js';

interface ProductFormData {
    name: string;
    system_code: string;
    inmetro_cert_number?: string;
    barcode?: string;
    description?: string;
    weight: number;
    width: number;
    height: number;
    percent_pieces_lost: number;
    product_type?: string;
    progress_level: number;
}

interface RawMaterialProduct {
    material_code: string;
    material_name: string;
    purchase_price: number;
    unit_consumption: number;
    units?: string;
    total_cost: number;
}

interface PackagingMaterialProduct {
    material_code: string;
    material_name: string;
    purchase_price: number;
    unit_consumption: number;
    units?: string;
    total_cost: number;
}

interface LaborProduct {
    labor_name: string;
    time_per_unit: number;
    conversion: number;
    rework: number;
    cost_per_minute: number;
    total_cost: number;
}

const emptyToNull = (value: any) => {
    if (value === "") return null;
    return value;
};

export async function handleProductTableInsert(
    formData: FormData,
    supabase: SupabaseClient,
    userId: string
) {
    // Parse the product data fields from the form
    const productData: ProductFormData = {
        name: JSON.parse(formData.get("name") as string),
        system_code: JSON.parse(formData.get("system_code") as string),
        inmetro_cert_number: JSON.parse((formData.get("inmetro_cert_number") as string)?.trim() || "null"),
        barcode: JSON.parse((formData.get("barcode") as string)?.trim() || "null"),
        description: JSON.parse((formData.get("description") as string)?.trim() || "null"),
        weight: JSON.parse(formData.get("weight") as string),
        width: JSON.parse(formData.get("width") as string),
        height: JSON.parse(formData.get("height") as string),
        percent_pieces_lost: JSON.parse(formData.get("percent_pieces_lost") as string),
        product_type: JSON.parse((formData.get("product_type") as string)?.trim() || "null"),
        progress_level: JSON.parse(formData.get("status") as string),
    };

    const image_urls: string[] = [];

    // Create the product object with empty string handling
    const product = {
        ...productData,
        system_code: emptyToNull(productData.system_code),
        inmetro_cert_number: emptyToNull(productData.inmetro_cert_number),
        barcode: emptyToNull(productData.barcode),
        description: emptyToNull(productData.description),
        product_type: emptyToNull(productData.product_type),
        image_urls,
    };

    // Insert the product
    // First, check if a product with the same system_code exists
    const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('system_code', product.system_code)
        .maybeSingle();

    // If it exists, delete it first
    if (existingProduct) {
        await supabase
            .from('products')
            .delete()
            .eq('id', existingProduct.id);
    }

    // Now insert the new product
    const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (insertError) {
        throw new Error(`Failed to insert product: ${insertError.message}`);
    }

    const productId = insertedProduct.id;
    const imageFiles = formData.getAll("image_urls") as File[];

    if (imageFiles && imageFiles.length > 0) {
        // Process each file and upload to storage
        for (const file of imageFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `${productId}/${fileName}`;

            // Convert file to ArrayBuffer for upload
            const arrayBuffer = await file.arrayBuffer();
            const fileBuffer = new Uint8Array(arrayBuffer);

            // Upload to Supabase storage
            const { error } = await supabase.storage
                .from('products')
                .upload(filePath, fileBuffer, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) {
                throw new Error(`Error uploading file: ${error.message}`);
            }

            // Get the public URL for the uploaded file
            const { data: urlData } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            image_urls.push(urlData.publicUrl);
        }
    }

    // Update the product with the image URLs
    const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({ image_urls })
        .eq('id', productId)
        .select()
        .single();

    if (updateError) {
        throw new Error(`Failed to update product: ${updateError.message}`);
    }

    return updatedProduct;
}

export async function updateLaborFromProduct(
    productId: string,
    supabase: SupabaseClient,
    formData: FormData
) {
    const labors = JSON.parse(formData.get("labor") as string) as LaborProduct[];

    if (!labors || labors.length === 0) {
        return;
    }

    for (const labor of labors) {
        const task_insert = {
            task: labor.labor_name,
            cost_per_minute: labor.cost_per_minute,
        };

        const { data: existingTask, error: fetchError } = await supabase
            .from('labor_types')
            .select()
            .or(`task.eq.${task_insert.task}`)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "No rows found" error
            throw new Error(`Failed to check for existing task: ${fetchError.message}`);
        }

        let upsertData;
        if (existingTask) {
            upsertData = { ...existingTask, ...task_insert };
        } else {
            upsertData = task_insert;
        }

        const { data: insertedTask, error: insertError } = await supabase
            .from('labor_types')
            .upsert(upsertData, { ignoreDuplicates: false })
            .select()
            .single();

        if (insertError) {
            throw new Error(`Failed to insert or update labor type: ${insertError.message}`);
        }

        const { error: insertError2 } = await supabase
            .from('products_and_labor')
            .insert({
                product_id: productId,
                task_id: insertedTask.task_id,
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

export async function updateRawMaterialFromProduct(
    productId: string,
    supabase: SupabaseClient,
    formData: FormData
) {
    const materials = JSON.parse(formData.get("materials") as string) as RawMaterialProduct[];

    if (!materials || materials.length === 0) {
        return;
    }

    for (const material of materials) {
        const rawMaterial = {
            material_code: material.material_code,
            material_name: material.material_name,
            purchase_price: material.purchase_price,
            units: emptyToNull(material.units),
        };
        const { data: existingRawMaterial, error: fetchError } = await supabase
            .from('raw_materials')
            .select()
            .or(`material_code.eq.${rawMaterial.material_code},material_name.eq.${rawMaterial.material_name}`)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "No rows found" error
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
        const { error: insertError2 } = await supabase
            .from('products_and_raw_materials')
            .insert({
                product_id: productId,
                material_code: insertedRawMaterial.material_id,
                unit_consumption: material.unit_consumption,
                total_cost: material.total_cost,

            });

        if (insertError2) {
            throw new Error(`Failed to insert or update material for product ${productId}: ${insertError2.message}`);
        }

    }
}
export async function updatePackagingMaterialFromProduct(
    productId: string,
    supabase: any,
    formData: FormData
) {
    // Parse the packaging materials from the form data
    const packaging_materials = JSON.parse(formData.get("packaging_materials") as string) as PackagingMaterialProduct[];

    if (!packaging_materials || packaging_materials.length === 0) {
        return;
    }

    // Process each packaging material
    for (const packaging_material of packaging_materials) {
        // Step 1: Prepare the packaging material data
        const packagingMaterial = {
            packaging_material_code: packaging_material.material_code,
            packaging_material_name: packaging_material.material_name,
            purchase_price: packaging_material.purchase_price,
            units: emptyToNull(packaging_material.units),
        };

        const { data: existingPackagingMaterial, error: fetchError } = await supabase
            .from('packaging_materials')
            .select()
            .or(`packaging_material_code.eq.${packagingMaterial.packaging_material_code},packaging_material_name.eq.${packagingMaterial.packaging_material_name}`)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "No rows found" error
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
        const { error: insertError2 } = await supabase
            .from('products_and_packaging_materials')
            .insert({
                product_id: productId,
                material_code: insertedPackagingMaterial.packaging_id,
                unit_consumption: packaging_material.unit_consumption,
                total_cost: packaging_material.total_cost,
            });

        if (insertError2) {
            throw new Error(`Failed to insert or update packaging material for product ${productId}: ${insertError2.message}`);
        }

    }
}

export async function updateTechnicalSheetFromProduct(
    productId: string,
    supabase: SupabaseClient,
    formData: FormData
) {
    const technical_sheet = formData.get("technical_sheet") as File;

    if (!technical_sheet) {
        return;
    }

    // Generate a unique file name to avoid collisions
    const fileExt = technical_sheet.name.split('.').pop();
    const fileName = `${productId}_${Date.now()}.${fileExt}`;
    const filePath = `${productId}/${fileName}`;

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('technical-sheets')
        .upload(filePath, technical_sheet, {
            cacheControl: '3600',
            upsert: true
        });

    if (uploadError) {
        throw new Error(`Failed to upload technical sheet: ${uploadError.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase
        .storage
        .from('technical-sheets')
        .getPublicUrl(filePath);

    // Check if the URL was successfully generated
    if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to generate public URL for technical sheet');
    }

    // Update the technical_sheets table with the new technical sheet
    const { error: insertError } = await supabase
        .from('technical_sheets')
        .insert({
            product_id: productId,
            technical_sheet: urlData.publicUrl,
        })
        .select()
        .single();

    if (insertError) {
        throw new Error(`Failed to insert technical sheet record: ${insertError.message}`);
    }
}
