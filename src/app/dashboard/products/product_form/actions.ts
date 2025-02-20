'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ProductStatus } from '@/lib/types'

export type ProductFormData = {
    name: string
    system_code: string
    inmetro_cert_number: string | null
    barcode: string | null
    description: string | null
    weight: number
    width: number
    height: number
    percent_pieces_lost?: number
    image_url: string | null
    product_type?: string
    status: ProductStatus
}

export async function createProduct(prevState: any, formData: FormData) {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Convert FormData to a regular object
    const formDataObj = Object.fromEntries(formData)

    // Fields that should be null if empty
    const nullableFields = [
        'inmetro_cert_number',
        'barcode',
        'description',
        'percent_pieces_lost',
        'image_url',
        'product_type'
    ]

    // Create cleaned data object with proper null values
    const cleanedData = {
        name: formDataObj.name,
        system_code: formDataObj.system_code,
        inmetro_cert_number: formDataObj.inmetro_cert_number || null,
        barcode: formDataObj.barcode || null,
        description: formDataObj.description || null,
        weight: parseFloat(formDataObj.weight as string),
        width: parseFloat(formDataObj.width as string),
        height: parseFloat(formDataObj.height as string),
        percent_pieces_lost: formDataObj.percent_pieces_lost ?
            parseFloat(formDataObj.percent_pieces_lost as string) : null,
        image_url: formDataObj.image_url || null,
        product_type: formDataObj.product_type || null,
        progress_level: formDataObj.status // Map status to progress_level
    }

    const { error } = await supabase
        .from('products')
        .insert(cleanedData)

    if (error) {
        throw new Error(`Error inserting product: ${error.message}`)
    }
    console.log('Creating product:', Object.fromEntries(formData))
}