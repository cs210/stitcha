'use client';

import * as React from 'react';
import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Enums } from '@/lib/types/supabase'
import type { Database } from '@/lib/types/supabase'
import { ComboboxFormField } from "@/components/ui/combobox-form-field";
import { Tables } from "@/lib/types/supabase";


type ProgressLevel = Database["public"]["Enums"]["progress_level"]
const progressLevelValues = ['Not Started', 'In Progress', 'Done'] as const satisfies readonly ProgressLevel[]
const progressLevelSchema = z.enum(progressLevelValues)

export type ProductFormData = {
	name: string
	system_code: string
	inmetro_cert_number: string
	barcode: string
	description: string
	weight: number
	width: number
	height: number
	percent_pieces_lost?: number
	image_urls: File[] | null
	product_type?: string
	status: ProgressLevel
	materials?: {
		material_code: string
		material_name: string
		purchase_price: number
		unit_consumption: number
		units?: string
		total_cost: number
	}[]
	packaging_materials?: {
		material_code: string
		material_name: string
		purchase_price: number
		unit_consumption: number
		units?: string
		total_cost: number
	}[]
}

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
	image_urls: z.array(z.instanceof(File)).nullable(),
	status: progressLevelSchema,
	materials: z.array(z.object({
		material_code: z.string().min(1, { message: "Material code is required" }),
		material_name: z.string().min(1, { message: "Material name is required" }),
		purchase_price: z.number()
			.positive({ message: "Purchase price must be greater than 0" })
			.min(0.01, { message: "Purchase price must be at least 0.01" })
			.refine(val => Number(val.toFixed(2)) === val, { message: "Purchase price can only have up to 2 decimal places" }),
		unit_consumption: z.number().positive({ message: "Unit consumption must be greater than 0" }),
		units: z.string().optional(),
	})).optional(),
	packaging_materials: z.array(z.object({
		material_code: z.string().min(1, { message: "Material code is required" }),
		material_name: z.string().min(1, { message: "Material name is required" }),
		purchase_price: z.number()
			.positive({ message: "Purchase price must be greater than 0" })
			.min(0.01, { message: "Purchase price must be at least 0.01" })
			.refine(val => Number(val.toFixed(2)) === val, { message: "Purchase price can only have up to 2 decimal places" }),
		unit_consumption: z.number().positive({ message: "Unit consumption must be greater than 0" }),
		units: z.string().optional(),
	})).optional()
})

// Define a type for raw materials
type RawMaterial = Tables<"raw_materials">;
type PackagingMaterial = Tables<"packaging_materials">;

export default function Page() {
	const { user } = useUser();
	const [loading, setLoading] = useState<boolean>(true);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [materials, setMaterials] = useState<RawMaterial[]>([]);
	const [packagingMaterials, setPackagingMaterials] = useState<PackagingMaterial[]>([]);
	const [materialOptions, setMaterialOptions] = useState({
		codes: [] as { value: string; label: string }[],
		names: [] as { value: string; label: string }[]
	});
	const [packagingMaterialOptions, setPackagingMaterialOptions] = useState({
		codes: [] as { value: string; label: string }[],
		names: [] as { value: string; label: string }[]
	});
	const [collapsedMaterials, setCollapsedMaterials] = useState<boolean[]>([]);
	const [collapsedPackagingMaterials, setCollapsedPackagingMaterials] = useState<boolean[]>([]);

	// 1. Define your form.
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
			image_urls: null,
			status: "Not Started",
			materials: [],
			packaging_materials: [],
		},
	})

	// Fetch materials on component mount
	useEffect(() => {
		async function fetchMaterials() {
			try {
				const response = await fetch('/api/products/raw_materials');
				const result = await response.json();

				if (response.ok && result.data) {
					setMaterials(result.data);
					console.log(result.data);

					// Transform raw materials into options for dropdowns
					const codes = result.data.map((material: RawMaterial) => ({
						value: material.material_code,
						label: material.material_code
					})) as { value: string; label: string }[];

					const names = result.data.map((material: RawMaterial) => ({
						value: material.material_name,
						label: material.material_name
					})) as { value: string; label: string }[];

					setMaterialOptions({
						codes: [...new Map(codes.map(item => [item.value, item])).values()],
						names: [...new Map(names.map(item => [item.value, item])).values()]
					});
				} else {
					console.error('Failed to fetch materials:', result.error);
				}
			} catch (error) {
				console.error('Error fetching materials:', error);
			} finally {
				setLoading(false);
			}
		}
		async function fetchPackagingMaterials() {
			try {
				const response = await fetch('/api/products/packaging_materials');
				const result = await response.json();

				if (response.ok && result.data) {
					setPackagingMaterials(result.data);
					console.log(result.data);

					// Transform packaging materials into options for dropdowns
					const codes = result.data.map((material: PackagingMaterial) => ({
						value: material.packaging_material_code,
						label: material.packaging_material_code
					})) as { value: string; label: string }[];

					const names = result.data.map((material: PackagingMaterial) => ({
						value: material.packaging_material_name,
						label: material.packaging_material_name
					})) as { value: string; label: string }[];

					setPackagingMaterialOptions({
						codes: [...new Map(codes.map(item => [item.value, item])).values()],
						names: [...new Map(names.map(item => [item.value, item])).values()]
					});
				} else {
					console.error('Failed to fetch packaging materials:', result.error);
				}
			} catch (error) {
				console.error('Error fetching packaging materials:', error);
			} finally {
				setLoading(false);
			}
		}
		fetchMaterials();
		fetchPackagingMaterials();
	}, []);

	// Auto-fill related fields when a material code is selected
	const handleMaterialCodeChange = (index: number, value: string) => {
		const selectedMaterial = materials.find(m => m.material_code === value);

		if (selectedMaterial) {
			// Update related fields
			form.setValue(`materials.${index}.material_name`, selectedMaterial.material_name || '');

			// Also set purchase price if available
			if (selectedMaterial.purchase_price) {
				form.setValue(`materials.${index}.purchase_price`, selectedMaterial.purchase_price);
			}

			// Also set units if available
			if (selectedMaterial.unit) {
				form.setValue(`materials.${index}.units`, selectedMaterial.unit);
			}
		}

		form.setValue(`materials.${index}.material_code`, value);
	};

	// Add new handler for packaging materials
	const handlePackagingMaterialCodeChange = (index: number, value: string) => {
		const selectedMaterial = packagingMaterials.find(m => m.packaging_material_code === value);

		if (selectedMaterial) {
			// Update related fields
			form.setValue(`packaging_materials.${index}.material_name`, selectedMaterial.packaging_material_name || '');

			// Also set purchase price if available
			if (selectedMaterial.purchase_price) {
				form.setValue(`packaging_materials.${index}.purchase_price`, selectedMaterial.purchase_price);
			}

			// Also set units if available
			if (selectedMaterial.unit) {
				form.setValue(`packaging_materials.${index}.units`, selectedMaterial.unit);
			}
		}

		form.setValue(`packaging_materials.${index}.material_code`, value);
	};

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsPending(true);
		try {
			// Show loading state while submitting
			setLoading(true);

			// Post the form values to the API
			const response = await fetch('/api/products/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create product');
			}

			// Reset form after successful submission
			form.reset();

			// Show success message or redirect
			toast.success('product created successfully');
		} catch (error) {
			console.error(error);
			// toast.error(error);
		} finally {
			setLoading(false);
			setIsPending(false);
		}
	}

	// Loading state
	if (loading) return <Loader />;

	return (
		<>
			<HeaderContainer>
				<Header text='Products' />
				<Description text='Manage and track customer products.' />
			</HeaderContainer>

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
								<FormField
									control={form.control}
									name="image_urls"
									render={({ field: { value, onChange, ...fieldProps } }) => (
										<FormItem>
											<FormLabel>Product Images</FormLabel>
											<FormControl>
												<div>
													<Input
														{...fieldProps}
														type="file"
														accept="image/*"
														multiple
														onChange={(e) => {
															const newFiles = Array.from(e.target.files || []);
															onChange((prevFiles: File[] | null) => {
																const existingFiles = prevFiles || [];
																return [...existingFiles, ...newFiles];
															});
														}}
													/>

													{/* Display selected files */}
													<div className="mt-2 space-y-2">
														{value?.map((file, index) => (
															<div key={index} className="flex items-center gap-2">
																<span className="text-sm">{file.name}</span>
																<Button
																	type="button"
																	variant="ghost"
																	size="sm"
																	onClick={() => {
																		onChange((prevFiles: File[] | null) =>
																			prevFiles?.filter((_, i) => i !== index) || null
																		);
																	}}
																>
																	Remove
																</Button>
															</div>
														))}
													</div>
												</div>
											</FormControl>
											<FormDescription>Optional: You can select multiple images</FormDescription>
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
											<FormLabel>Inmetro Certification Number</FormLabel>
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
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<FormLabel>Raw Materials</FormLabel>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											form.setValue('materials', [
												...(form.getValues('materials') || []),
												{
													material_code: '',
													material_name: '',
													purchase_price: 0,
													unit_consumption: 0,
													units: '',
													total_cost: 0
												}
											]);
											setCollapsedMaterials(prev => [...prev, false]);
										}}
									>
										Add Material
									</Button>
								</div>

								{(form.watch('materials') || []).map((material, index) => (
									<Card
										key={index}
										className="cursor-pointer"
										onClick={() => {
											if (collapsedMaterials[index]) {
												setCollapsedMaterials(prev => {
													const next = [...prev];
													next[index] = false;
													return next;
												});
											}
										}}
									>
										<CardContent className="pt-6">
											{collapsedMaterials[index] ? (
												<div className="grid grid-cols-3 gap-4">
													<div>
														<FormLabel className="text-sm">Material Code</FormLabel>
														<p className="mt-1">{material.material_code || '-'}</p>
													</div>
													<div>
														<FormLabel className="text-sm">Material Name</FormLabel>
														<p className="mt-1">{material.material_name || '-'}</p>
													</div>
													<div>
														<FormLabel className="text-sm">Unit Consumption</FormLabel>
														<p className="mt-1">{material.unit_consumption || '-'}</p>
													</div>
												</div>
											) : (
												<>
													<div className="grid gap-4 md:grid-cols-3">
														<FormField
															control={form.control}
															name={`materials.${index}.material_code`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Material Code</FormLabel>
																	<FormControl>
																		<ComboboxFormField
																			options={materialOptions.codes}
																			value={field.value}
																			onChange={(value) => handleMaterialCodeChange(index, value)}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`materials.${index}.material_name`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Material Name</FormLabel>
																	<FormControl>
																		<ComboboxFormField
																			options={materialOptions.names}
																			value={field.value}
																			onChange={field.onChange}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`materials.${index}.purchase_price`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Purchase Price</FormLabel>
																	<FormControl>
																		<div className="relative">
																			<span className="absolute right-3 top-1/2 -translate-y-1/2">R$</span>
																			<Input
																				type="number"
																				step="0.01"
																				className="pr-8"
																				{...field}
																				onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
																			/>
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`materials.${index}.unit_consumption`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Unit Consumption</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			step="0.01"
																			{...field}
																			onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`materials.${index}.units`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Units</FormLabel>
																	<FormControl>
																		<Input {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`materials.${index}.total_cost`}
															render={({ field }) => {
																// Watch for changes in purchase_price and unit_consumption
																const purchasePrice = form.watch(`materials.${index}.purchase_price`) || 0;
																const unitConsumption = form.watch(`materials.${index}.unit_consumption`) || 0;

																// Calculate and update total cost whenever dependencies change
																React.useEffect(() => {
																	const totalCost = purchasePrice * unitConsumption;
																	form.setValue(`materials.${index}.total_cost`, totalCost);
																}, [purchasePrice, unitConsumption, index, form]);

																return (
																	<FormItem>
																		<FormLabel>Total Cost</FormLabel>
																		<FormControl>
																			<div className="relative">
																				<span className="absolute right-3 top-1/2 -translate-y-1/2">R$</span>
																				<Input
																					type="number"
																					step="0.01"
																					className="pr-8"
																					{...field}
																					value={field.value || 0}
																					disabled
																				/>
																			</div>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																);
															}}
														/>
													</div>

													<div className="flex gap-2 mt-4">
														<Button
															type="button"
															variant="destructive"
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																const materials = form.getValues('materials');
																if (materials) {
																	materials.splice(index, 1);
																	form.setValue('materials', materials);
																	setCollapsedMaterials(prev => {
																		const next = [...prev];
																		next.splice(index, 1);
																		return next;
																	});
																}
															}}
														>
															Remove
														</Button>
														<Button
															type="button"
															variant="secondary"
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																setCollapsedMaterials(prev => {
																	const next = [...prev];
																	next[index] = true;
																	return next;
																});
															}}
														>
															Done
														</Button>
													</div>
												</>
											)}
										</CardContent>
									</Card>
								))}
							</div>

							{/* Move percent pieces lost field here, before the total cost */}
							<div className="grid gap-4 md:grid-cols-2 justify-end">
								<div></div> {/* Empty div for spacing */}
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
							</div>

							{/* Update the total cost calculation to include percent pieces lost */}
							<div className="flex justify-end items-center">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<span>Total Raw Material Cost:</span>
									<span>R$ {(() => {
										const baseCost = form.watch('materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
										const percentLost = form.watch('percent_pieces_lost') || 0;
										return (baseCost * (1 + percentLost / 100)).toFixed(2);
									})()}</span>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<FormLabel>Packaging Materials</FormLabel>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											form.setValue('packaging_materials', [
												...(form.getValues('packaging_materials') || []),
												{
													material_code: '',
													material_name: '',
													purchase_price: 0,
													unit_consumption: 0,
													units: '',
													total_cost: 0
												}
											]);
											setCollapsedPackagingMaterials(prev => [...prev, false]);
										}}
									>
										Add Packaging Material
									</Button>
								</div>

								{(form.watch('packaging_materials') || []).map((material, index) => (
									<Card
										key={index}
										className="cursor-pointer"
										onClick={() => {
											if (collapsedPackagingMaterials[index]) {
												setCollapsedPackagingMaterials(prev => {
													const next = [...prev];
													next[index] = false;
													return next;
												});
											}
										}}
									>
										<CardContent className="pt-6">
											{collapsedPackagingMaterials[index] ? (
												<div className="grid grid-cols-3 gap-4">
													<div>
														<FormLabel className="text-sm">Material Code</FormLabel>
														<p className="mt-1">{material.material_code || '-'}</p>
													</div>
													<div>
														<FormLabel className="text-sm">Material Name</FormLabel>
														<p className="mt-1">{material.material_name || '-'}</p>
													</div>
													<div>
														<FormLabel className="text-sm">Unit Consumption</FormLabel>
														<p className="mt-1">{material.unit_consumption || '-'}</p>
													</div>
												</div>
											) : (
												<>
													<div className="grid gap-4 md:grid-cols-3">
														<FormField
															control={form.control}
															name={`packaging_materials.${index}.material_code`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Material Code</FormLabel>
																	<FormControl>
																		<ComboboxFormField
																			options={packagingMaterialOptions.codes}
																			value={field.value}
																			onChange={(value) => handlePackagingMaterialCodeChange(index, value)}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`packaging_materials.${index}.material_name`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Material Name</FormLabel>
																	<FormControl>
																		<ComboboxFormField
																			options={packagingMaterialOptions.names}
																			value={field.value}
																			onChange={field.onChange}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`packaging_materials.${index}.purchase_price`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Purchase Price</FormLabel>
																	<FormControl>
																		<div className="relative">
																			<span className="absolute right-3 top-1/2 -translate-y-1/2">R$</span>
																			<Input
																				type="number"
																				step="0.01"
																				className="pr-8"
																				{...field}
																				onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
																			/>
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`packaging_materials.${index}.unit_consumption`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Unit Consumption</FormLabel>
																	<FormControl>
																		<Input
																			type="number"
																			step="0.01"
																			{...field}
																			onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`packaging_materials.${index}.units`}
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Units</FormLabel>
																	<FormControl>
																		<Input {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name={`packaging_materials.${index}.total_cost`}
															render={({ field }) => {
																// Watch for changes in purchase_price and unit_consumption
																const purchasePrice = form.watch(`packaging_materials.${index}.purchase_price`) || 0;
																const unitConsumption = form.watch(`packaging_materials.${index}.unit_consumption`) || 0;

																// Calculate and update total cost whenever dependencies change
																React.useEffect(() => {
																	const totalCost = purchasePrice * unitConsumption;
																	form.setValue(`packaging_materials.${index}.total_cost`, totalCost);
																}, [purchasePrice, unitConsumption, index, form]);

																return (
																	<FormItem>
																		<FormLabel>Total Cost</FormLabel>
																		<FormControl>
																			<div className="relative">
																				<span className="absolute right-3 top-1/2 -translate-y-1/2">R$</span>
																				<Input
																					type="number"
																					step="0.01"
																					className="pr-8"
																					{...field}
																					value={field.value || 0}
																					disabled
																				/>
																			</div>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																);
															}}
														/>
													</div>

													<div className="flex gap-2 mt-4">
														<Button
															type="button"
															variant="destructive"
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																const materials = form.getValues('packaging_materials');
																if (materials) {
																	materials.splice(index, 1);
																	form.setValue('packaging_materials', materials);
																	setCollapsedPackagingMaterials(prev => {
																		const next = [...prev];
																		next.splice(index, 1);
																		return next;
																	});
																}
															}}
														>
															Remove
														</Button>
														<Button
															type="button"
															variant="secondary"
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																setCollapsedPackagingMaterials(prev => {
																	const next = [...prev];
																	next[index] = true;
																	return next;
																});
															}}
														>
															Done
														</Button>
													</div>
												</>
											)}
										</CardContent>
									</Card>
								))}
							</div>

							{/* Replace the packaging materials total cost summary */}
							<div className="flex justify-end items-center">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<span>Total Packaging Material Cost:</span>
									<span>R$ {form.watch('packaging_materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0).toFixed(2)}</span>
								</div>
							</div>

							{/* Add the total material cost summary */}
							<div className="flex justify-end items-center border-t pt-2">
								<div className="flex items-center gap-2 font-medium">
									<span>Total Material Cost:</span>
									<span>R$ {(() => {
										const rawMaterialCost = (() => {
											const baseCost = form.watch('materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
											const percentLost = form.watch('percent_pieces_lost') || 0;
											return baseCost * (1 + percentLost / 100);
										})();
										const packagingCost = form.watch('packaging_materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
										return (rawMaterialCost + packagingCost).toFixed(2);
									})()}</span>
								</div>
							</div>

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
												{(Object.values(progressLevelValues) as ProgressLevel[]).map((status) => (
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
		</>
	);
}