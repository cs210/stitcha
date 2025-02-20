'use server'

// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
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

    /*
       const supabase = createServerComponentClient({ cookies })
   
       // Handle file upload
       const file = formData.get('file') as File
       if (file && file.size > 0) {
           const fileName = `${crypto.randomUUID()}-${file.name}`
   
           const { error: uploadError } = await supabase
               .storage
               .from('products')
               .upload(fileName, file)
   
           if (!uploadError) {
               const { data: urlData } = await supabase
                   .storage
                   .from('products')
                   .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry
   
               formData.set('image_url', urlData?.signedUrl || '')
           }
       }
   */
    // TODO: Process rest of form data
    console.log('Creating product:', Object.fromEntries(formData))
} 