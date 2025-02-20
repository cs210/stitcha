"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useTransition } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createProduct, type ProductFormData } from "./actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductStatus } from "@/lib/types"
const formSchema = z.object({
    product_type: z.string().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    system_code: z.string().min(1, { message: "System code is required" }),
    inmetro_cert_number: z.string().optional(),
    barcode: z.string().optional(),
    description: z.string().optional(),
    weight: z.number().positive({ message: "Weight must be positive" }),
    width: z.number().positive({ message: "Width must be positive" }),
    height: z.number().positive({ message: "Height must be positive" }),
    percent_pieces_lost: z.number().min(0).max(100).optional(),
    image_url: z.union([
        z.instanceof(File), // ✅ Allows an uploaded file 
        z.literal(""), // ✅ Allows an empty string (React-controlled input handling)
    ]),
    status: z.nativeEnum(ProductStatus),
})

export default function ProductForm() {
    const [isPending, startTransition] = useTransition()
    const supabase = createClientComponentClient()

    const form = useForm<ProductFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            product_type: "",
            name: "",
            system_code: "",
            inmetro_cert_number: "",
            barcode: "",
            description: "",
            weight: 0,
            width: 0,
            height: 0,
            percent_pieces_lost: 0,
            image_url: "",
            status: ProductStatus.Started,
        },
    })

    async function onSubmit(data: ProductFormData) {
        startTransition(async () => {
            const formData = new FormData();

            // ✅ Check if an image file is provided
            if (data.image_url instanceof File) {
                const file = data.image_url;
                const fileName = `${crypto.randomUUID()}-${file.name}`;

                // ✅ Upload file to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from("products")
                    .upload(fileName, file);

                if (!uploadError) {
                    // ✅ Get the signed URL of the uploaded file
                    const { data: urlData } = await supabase
                        .storage
                        .from("products")
                        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1-year expiry

                    formData.append("image_url", urlData?.signedUrl || "");
                }
            } else {
                formData.append("image_url", "");
            }

            // ✅ Append the rest of the form data (excluding image_url since it's handled above)
            Object.entries(data).forEach(([key, value]) => {
                if (key !== "image_url") {
                    formData.append(key, value?.toString() ?? "");
                }
            });

            // ✅ Submit the form data
            await createProduct(null, formData);
        });
    }


    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="system_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>System Code *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="inmetro_cert_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Inmetro Certification Number *</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="barcode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Barcode</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="product_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Type</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-4 md:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (kg) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
                                                onBlur={(e) => {
                                                    const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
                                                    field.onChange(value);
                                                    field.onBlur();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="width"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Width (cm) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
                                                onBlur={(e) => {
                                                    const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
                                                    field.onChange(value);
                                                    field.onBlur();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Height (cm) *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
                                                onBlur={(e) => {
                                                    const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
                                                    field.onChange(value);
                                                    field.onBlur();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="percent_pieces_lost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Percent Pieces Lost (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
                                                onBlur={(e) => {
                                                    const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
                                                    field.onChange(value);
                                                    field.onBlur();
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="image_url"
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                        <FormLabel>Product Image</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...fieldProps}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    // Clear the previous value and set the new one
                                                    onChange(e.target.files?.[0] || "");
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(Object.values(ProductStatus) as ProductStatus[]).map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => form.reset()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving..." : "Save Product"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

