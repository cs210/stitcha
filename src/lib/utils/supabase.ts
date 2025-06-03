import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Upload product images to Supabase storage and return their signed URLs.
 * 
 * @param supabase - Supabase client instance
 * @param productId - ID of the product
 * @param imageFiles - Array of image files to upload
 * @returns Promise resolving to array of signed URLs for the uploaded images
 * @throws Error if there's an error during upload or URL generation
 */
export async function uploadProductImages(
    supabase: SupabaseClient,
    productId: string,
    imageFiles: File[]
): Promise<string[]> {
    const imageUrls: string[] = [];

    if (!imageFiles || imageFiles.length === 0) {
        return imageUrls;
    }

    for (const file of imageFiles) {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${productId}/${fileName}`;

        try {
            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    contentType: file.type,
                });

            if (uploadError) {
                throw new Error(`Error uploading file: ${uploadError.message}`);
            }

            // Get signed URL (1 year expiration)
            const { data: urlData, error: urlError } = await supabase.storage
                .from('products')
                .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiration

            if (urlError) {
                throw new Error(`Failed to generate signed URL: ${urlError.message}`);
            }

            if (!urlData?.signedUrl) {
                throw new Error('Failed to generate signed URL');
            }

            imageUrls.push(urlData.signedUrl);

        } catch (error) {
            throw new Error(`Error processing image upload: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    return imageUrls;
}

/**
 * Upload a technical sheet to Supabase storage and return its signed URL.
 * 
 * @param supabase - Supabase client instance
 * @param productId - ID of the product
 * @param technicalSheet - Technical sheet file to upload
 * @returns Promise resolving to signed URL for the uploaded technical sheet
 * @throws Error if there's an error during upload or URL generation
 */
export async function uploadTechnicalSheet(
    supabase: SupabaseClient,
    productId: string,
    technicalSheet: File
): Promise<string> {
    if (!technicalSheet) {
        return '';
    }

    try {
        // Generate unique filename
        const fileExt = technicalSheet.name.split('.').pop();
        const fileName = `${productId}_${Date.now()}.${fileExt}`;
        const filePath = `${productId}/${fileName}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
            .from('technical-sheets')
            .upload(filePath, technicalSheet, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Failed to upload technical sheet: ${uploadError.message}`);
        }

        // Get signed URL (7 days expiration)
        const { data: urlData, error: urlError } = await supabase.storage
            .from('technical-sheets')
            .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days expiration

        if (urlError) {
            throw new Error(`Failed to generate signed URL: ${urlError.message}`);
        }

        if (!urlData?.signedUrl) {
            throw new Error('Failed to generate signed URL');
        }

        return urlData.signedUrl;

    } catch (error) {
        throw new Error(`Error processing technical sheet upload: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Delete all files associated with a product from Supabase storage.
 * This includes both product images and technical sheets.
 * 
 * @param supabase - Supabase client instance
 * @param productId - ID of the product whose files should be deleted
 * @throws Error if there's an error during file deletion
 */
export async function deleteProductFiles(
    supabase: SupabaseClient,
    productId: string
): Promise<void> {
    try {
        // 1. Delete product images
        const { data: productFiles, error: listError } = await supabase.storage
            .from('products')
            .list(productId, {
                limit: 100,
                offset: 0,
                search: '',
            });

        if (listError) {
            throw new Error(`Failed to list product files: ${listError.message}`);
        }

        if (productFiles && productFiles.length > 0) {
            const filePaths = productFiles.map((file) => `${productId}/${file.name}`);
            const { error: removeError } = await supabase.storage
                .from('products')
                .remove(filePaths);

            if (removeError) {
                throw new Error(`Failed to delete product images: ${removeError.message}`);
            }
        }

        // 2. Delete technical sheet
        const { data: sheetFiles, error: sheetListError } = await supabase.storage
            .from('technical-sheets')
            .list(productId);

        if (sheetListError) {
            throw new Error(`Failed to list technical sheet files: ${sheetListError.message}`);
        }

        if (sheetFiles && sheetFiles.length > 0) {
            const sheetPaths = sheetFiles.map((file) => `${productId}/${file.name}`);
            const { error: sheetDeleteError } = await supabase.storage
                .from('technical-sheets')
                .remove(sheetPaths);

            if (sheetDeleteError) {
                throw new Error(`Failed to delete technical sheet: ${sheetDeleteError.message}`);
            }
        }
    } catch (error) {
        throw new Error(`Failed to delete product files: ${error instanceof Error ? error.message : String(error)}`);
    }
}

