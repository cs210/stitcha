'use client';

import { FormContainer } from '@/components/custom/form/form-container';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ComboboxFormField } from '@/components/ui/combobox-form-field';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Labor, PackagingMaterial, ProgressLevel, RawMaterial } from '@/lib/schemas/global.types';
import { handleLaborChange, handleMaterialCodeChange, handleMaterialNameChange, handlePackagingMaterialCodeChange, handlePackagingMaterialNameChange } from '@/lib/utils/form-utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const progressLevelValues = ['Not Started', 'In Progress', 'Done'] as const satisfies readonly ProgressLevel[];
const progressLevelSchema = z.enum(progressLevelValues);

export type ProductFormData = {
	name: string;
	system_code: string;
	inmetro_cert_number: string;
	barcode: string;
	description: string;
	weight: number;
	width: number;
	height: number;
	total_units: number;
	percent_pieces_lost?: number;
	image_urls: File[] | null;
	product_type: string;
	status: ProgressLevel;
	materials?: {
		code: string;
		name: string;
		purchase_price: number;
		unit_consumption: number;
		units?: string;
		total_cost: number;
	}[];
	packaging_materials?: {
		code: string;
		name: string;
		purchase_price: number;
		unit_consumption: number;
		units?: string;
		total_cost: number;
	}[];
	labor?: {
		task: string;
		time_per_unit: number;
		conversion: number;
		rework: number;
		cost_per_minute: number;
		total_cost: number;
	}[];
	general_expenses: number;
	royalties: number;
	selling_price: number;
	technical_sheet?: File | null;
};

const formSchema = z.object({
	product_type: z.string().min(1, { message: 'Product type is required' }),
	name: z.string().min(1, { message: 'Name is required' }),
	system_code: z.string().min(1, { message: 'System code is required' }),
	inmetro_cert_number: z.string().optional(),
	barcode: z.string().optional(),
	description: z.string().min(1, { message: 'Description is required' }),
	weight: z.number().positive({ message: 'Weight must be positive' }),
	width: z.number().positive({ message: 'Width must be positive' }),
	height: z.number().positive({ message: 'Height must be positive' }),
	total_units: z.number().positive({ message: 'Total units must be positive' }),
	percent_pieces_lost: z
		.number()
		.min(0, { message: 'Percent pieces lost must be 0 or greater' })
		.max(100, { message: 'Percent pieces lost must be 100 or less' })
		.optional(),
	image_urls: z.array(z.instanceof(File)).min(1, { message: 'At least one product image is required' }).nullable(),
	status: progressLevelSchema,
	materials: z
		.array(
			z.object({
				code: z.string().min(1, { message: 'Material code is required' }),
				name: z.string().min(1, { message: 'Material name is required' }),
				purchase_price: z
					.number()
					.positive({ message: 'Purchase price must be greater than 0' })
					.min(0.01, { message: 'Purchase price must be at least 0.01' })
					.refine((val) => Number(val.toFixed(2)) === val, { message: 'Purchase price can only have up to 2 decimal places' }),
				unit_consumption: z.number().positive({ message: 'Unit consumption must be greater than 0' }),
				units: z.string().optional(),
				total_cost: z.number(),
			})
		)
		.optional(),
	packaging_materials: z
		.array(
			z.object({
				code: z.string().min(1, { message: 'Material code is required' }),
				name: z.string().min(1, { message: 'Material name is required' }),
				purchase_price: z
					.number()
					.positive({ message: 'Purchase price must be greater than 0' })
					.min(0.01, { message: 'Purchase price must be at least 0.01' })
					.refine((val) => Number(val.toFixed(2)) === val, { message: 'Purchase price can only have up to 2 decimal places' }),
				unit_consumption: z.number().positive({ message: 'Unit consumption must be greater than 0' }),
				units: z.string().optional(),
				total_cost: z.number(),
			})
		)
		.optional(),
	labor: z
		.array(
			z.object({
				task: z.string().min(1, { message: 'Task name is required' }),
				time_per_unit: z.number().min(0, { message: 'Time per unit must be 0 or greater' }),
				conversion: z.number().min(0, { message: 'Conversion must be 0 or greater' }),
				rework: z
					.number()
					.min(0, { message: 'Rework percentage must be between 0 and 100' })
					.max(100, { message: 'Rework percentage must be between 0 and 100' }),
				cost_per_minute: z
					.number()
					.min(0, { message: 'Cost per minute must be 0 or greater' })
					.refine((val) => Number(val.toFixed(2)) === val, { message: 'Cost per minute can only have up to 2 decimal places' }),
				total_cost: z.number(),
			})
		)
		.optional(),
	general_expenses: z
		.number()
		.min(0, { message: 'General expenses must be 0 or greater' })
		.refine((val) => Number(val.toFixed(2)) === val, { message: 'General expenses can only have up to 2 decimal places' }),
	royalties: z
		.number()
		.min(0, { message: 'Royalties percentage must be 0 or greater' })
		.max(100, { message: 'Royalties percentage must be between 0 and 100' }),
	selling_price: z
		.number()
		.positive({ message: 'Selling price must be greater than 0' })
		.min(0.01, { message: 'Selling price must be at least 0.01' })
		.refine((val) => Number(val.toFixed(2)) === val, { message: 'Selling price can only have up to 2 decimal places' }),
	technical_sheet: z.instanceof(File).nullable().optional(),
});

export default function Page() {	
	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(true);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [materials, setMaterials] = useState<RawMaterial[]>([]);
	const [packagingMaterials, setPackagingMaterials] = useState<PackagingMaterial[]>([]);
	const [labors, setLabors] = useState<Labor[]>([]);
	const [materialOptions, setMaterialOptions] = useState({
		codes: [] as { value: string; label: string }[],
		names: [] as { value: string; label: string }[],
	});
	const [packagingMaterialOptions, setPackagingMaterialOptions] = useState({
		codes: [] as { value: string; label: string }[],
		names: [] as { value: string; label: string }[],
	});
	const [laborOptions, setLaborOptions] = useState<{ value: string; label: string }[]>([]);
	const [collapsedMaterials, setCollapsedMaterials] = useState<boolean[]>([]);
	const [collapsedPackagingMaterials, setCollapsedPackagingMaterials] = useState<boolean[]>([]);
	const [collapsedLabor, setCollapsedLabor] = useState<boolean[]>([]);

	const form = useForm<ProductFormData>({
		resolver: zodResolver(formSchema),
		mode: 'onBlur',
		defaultValues: {
			product_type: '',
			name: '',
			system_code: '',
			inmetro_cert_number: '',
			barcode: '',
			description: '',
			weight: 0,
			width: 0,
			height: 0,
			total_units: 1,
			percent_pieces_lost: 0,
			image_urls: null,
			status: 'Not Started',
			materials: [],
			packaging_materials: [],
			labor: [],
			general_expenses: 0,
			royalties: 0,
			selling_price: 0,
			technical_sheet: null,
		},
	});

	useEffect(() => {
		// Fetch materials from the database
		async function fetchMaterials() {
			try {
				const response = await fetch('/api/raw-materials');
				const result = await response.json();

				if (response.ok && result.data) {
					setMaterials(result.data);

					// Transform raw materials into options for dropdowns
					const codes = result.data.map((material: RawMaterial) => ({
						value: material.code,
						label: material.code,
					})) as { value: string; label: string }[];

					const names = result.data.map((material: RawMaterial) => ({
						value: material.name,
						label: material.name,
					})) as { value: string; label: string }[];

					setMaterialOptions({
						codes: [...new Map(codes.map((item) => [item.value, item])).values()],
						names: [...new Map(names.map((item) => [item.value, item])).values()],
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

		// Fetch packaging materials from the database
		async function fetchPackagingMaterials() {
			try {
				const response = await fetch('/api/packaging-materials');
				const result = await response.json();

				if (response.ok && result.data) {
					setPackagingMaterials(result.data);

					// Transform packaging materials into options for dropdowns
					const codes = result.data.map((material: PackagingMaterial) => ({
						value: material.code,
						label: material.code,
					})) as { value: string; label: string }[];

					const names = result.data.map((material: PackagingMaterial) => ({
						value: material.name,
						label: material.name,
					})) as { value: string; label: string }[];

					setPackagingMaterialOptions({
						codes: [...new Map(codes.map((item) => [item.value, item])).values()],
						names: [...new Map(names.map((item) => [item.value, item])).values()],
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

		// Fetch labor types from the database
		async function fetchLabor() {
			try {
				const response = await fetch('/api/labor');
				const result = await response.json();

				if (response.ok && result.data) {
					setLabors(result.data);

					// Transform labor into options for dropdowns
					const names = result.data.map((labor: Labor) => ({
						value: labor.task,
						label: labor.task,
					})) as { value: string; label: string }[];

					setLaborOptions([...new Map(names.map((item) => [item.value, item])).values()]);
				} else {
					console.error('Failed to fetch labor:', result.error);
				}
			} catch (error) {
				console.error('Error fetching labor:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchMaterials();
		fetchPackagingMaterials();
		fetchLabor();
	}, []);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsPending(true);

		try {
			const formData = new FormData();

			// Calculate raw material cost first
			const rawMaterialsBaseCost = values.materials?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
			const percentLost = values.percent_pieces_lost || 0;
			const totalRawMaterialCost = rawMaterialsBaseCost * (1 + percentLost / 100);
			// Ensure the value is a number and not null
			formData.append('raw_material_cost', JSON.stringify(totalRawMaterialCost));

			// Add all non-file fields
			Object.entries(values).forEach(([key, value]) => {
				if (key !== 'image_urls' && key !== 'technical_sheet') {
					formData.append(key, JSON.stringify(value));
				}
			});

			// Calculate and add the total packaging material cost
			const totalPackagingMaterialCost = values.packaging_materials?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
			formData.append('packaging_cost', JSON.stringify(totalPackagingMaterialCost));
			// Calculate and add the total labor cost
			const totalLaborCost = values.labor?.reduce((sum, labor) => sum + (labor.total_cost || 0), 0) || 0;
			formData.append('total_labor_cost', JSON.stringify(totalLaborCost));
			// Calculate and add the total material cost (raw materials + packaging)
			const totalMaterialCost = totalRawMaterialCost + totalPackagingMaterialCost;
			formData.append('total_material_cost', JSON.stringify(totalMaterialCost));
			// Calculate and add the total costs
			const totalCost = totalMaterialCost + totalLaborCost + values.general_expenses + (values.royalties / 100) * values.selling_price;
			formData.append('total_cost', JSON.stringify(totalCost));
			// Calculate and add the selling price
			const margin = ((values.selling_price - totalCost) / values.selling_price) * 100;
			formData.append('margin', JSON.stringify(margin));

			// Add image files if they exist
			if (values.image_urls) {
				values.image_urls.forEach((file, index) => {
					formData.append(`image_urls`, file);
				});
			}

			if (values.technical_sheet) {
				formData.append('technical_sheet', values.technical_sheet);
			}

			const response = await fetch('/api/products', {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create product');
			}

			toast.success('Product created successfully');

			router.push('/dashboard/products');
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			setLoading(false);
			setIsPending(false);
		}
	}

	if (loading) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	return (
		<div className='flex flex-col min-h-0'>
			<HeaderContainer>
				<H2>New Product</H2>
				<P className='mt-2'>Create a new product.</P>
			</HeaderContainer>

			<div className='py-4'>
				<Form {...form}>
					<FormContainer onSubmit={form.handleSubmit(onSubmit, (errors) => {
						// Get the first error field
						const firstError = Object.keys(errors)[0];
						if (firstError) {
							// Find the input element for the first error
							const errorInput = document.querySelector(`[name="${firstError}"]`) as HTMLElement;
							if (errorInput) {
								// Scroll the error into view
								errorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
								// Focus the input
								errorInput.focus();
							}
						}
					})}>
						<FormField
							control={form.control}
							name='name'
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
							name='image_urls'
							render={({ field: { value, onChange, ...fieldProps } }) => (
								<FormItem>
									<FormLabel>Product Images *</FormLabel>
									<FormControl>
										<div>
											<div className="relative">
												<div className="flex items-center gap-2">
													<Button
														type="button"
														variant="outline"
														onClick={() => {
															const fileInput = document.createElement('input');
															fileInput.type = 'file';
															fileInput.accept = 'image/*';
															fileInput.multiple = true;
															fileInput.onchange = (e) => {
																const newFiles = Array.from((e.target as HTMLInputElement).files || []);
																onChange([...(value || []), ...newFiles]);
															};
															fileInput.click();
														}}
													>
														Choose Files
													</Button>
													<span className="text-sm text-muted-foreground">
														{value && value.length > 0
															? `${value.length} ${value.length === 1 ? 'file' : 'files'} selected`
															: 'No file chosen'}
													</span>
												</div>
												<input
													{...fieldProps}
													type='file'
													accept='image/*'
													multiple
													key={value?.length}
													onChange={(e) => {
														const newFiles = Array.from(e.target.files || []);
														onChange([...(value || []), ...newFiles]);
													}}
													className="hidden"
												/>
											</div>

											{/* Display selected files */}
											<div className='mt-2 space-y-2'>
												{value?.map((file, index) => (
													<div key={index} className='flex items-center gap-2'>
														<span className='text-sm'>{file.name}</span>
														<Button
															type='button'
															variant='ghost'
															size='sm'
															onClick={() => {
																const newFiles = value.filter((_, i) => i !== index);
																onChange(newFiles);
																// Reset the file input
																const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
																if (fileInput) {
																	fileInput.value = '';
																}
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
						<FormField
							control={form.control}
							name='system_code'
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
							name='inmetro_cert_number'
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

						<FormField
							control={form.control}
							name='barcode'
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
							name='product_type'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Product Type *</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description *</FormLabel>
									<FormControl>
										<Textarea {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<FormLabel>Raw Materials</FormLabel>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => {
										form.setValue('materials', [
											...(form.getValues('materials') || []),
											{
												code: '',
												name: '',
												purchase_price: 0,
												unit_consumption: 0,
												units: '',
												total_cost: 0,
											},
										]);
										setCollapsedMaterials((prev) => [...prev, false]);
									}}
								>
									Add Material
								</Button>
							</div>

							{(form.watch('materials') || []).map((material, index) => (
								<Card
									key={index}
									className='cursor-pointer'
									onClick={() => {
										if (collapsedMaterials[index]) {
											setCollapsedMaterials((prev) => {
												const next = [...prev];
												next[index] = false;
												return next;
											});
										}
									}}
								>
									<CardContent className='pt-6'>
										{collapsedMaterials[index] ? (
											<div className='grid grid-cols-3 gap-4'>
												<div>
													<FormLabel className='text-sm'>Material Code</FormLabel>
													<p className='mt-1'>{material.code || '-'}</p>
												</div>
												<div>
													<FormLabel className='text-sm'>Material Name</FormLabel>
													<p className='mt-1'>{material.name || '-'}</p>
												</div>
												<div>
													<FormLabel className='text-sm'>Unit Consumption</FormLabel>
													<p className='mt-1'>{material.unit_consumption || '-'}</p>
												</div>
											</div>
										) : (
											<>
												<div className='grid gap-4 md:grid-cols-3'>
													<FormField
														control={form.control}
														name={`materials.${index}.code`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Material Code</FormLabel>
																<FormControl>
																	<ComboboxFormField
																		options={materialOptions.codes}
																		value={field.value}
																		onChange={(value) => handleMaterialCodeChange(form, materials, index, value)}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name={`materials.${index}.name`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Material Name</FormLabel>
																<FormControl>
																	<ComboboxFormField
																		options={materialOptions.names}
																		value={field.value}
																		onChange={(value) => handleMaterialNameChange(form, materials, index, value)}
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
																	<div className='relative'>
																		<span className='absolute right-3 top-1/2 -translate-y-1/2'>R$</span>
																		<Input
																			type='number'
																			step='0.01'
																			className='pr-8'
																			{...field}
																			onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
																			onBlur={(e) => {
																				const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
																				field.onChange(value);
																				field.onBlur();
																			}}
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
																		type='number'
																		step='0.01'
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
																const totalCost = Number((purchasePrice * unitConsumption).toFixed(2));
																field.onChange(totalCost);
															}, [purchasePrice, unitConsumption, index, form]);

															return (
																<FormItem>
																	<FormLabel>Total Cost</FormLabel>
																	<FormControl>
																		<div className='relative'>
																			<span className='absolute right-3 top-1/2 -translate-y-1/2'>R$</span>
																			<Input type='number' step='0.01' className='pr-8' {...field} value={field.value || 0} disabled />
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															);
														}}
													/>
												</div>

												<div className='flex gap-2 mt-4'>
													<Button
														type='button'
														variant='destructive'
														size='sm'
														onClick={(e) => {
															e.stopPropagation();
															const materials = form.getValues('materials');
															if (materials) {
																materials.splice(index, 1);
																form.setValue('materials', materials);
																setCollapsedMaterials((prev) => {
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
														type='button'
														variant='secondary'
														size='sm'
														onClick={async (e) => {
															e.stopPropagation();

															// Validate just this material's fields
															const isValid = await form.trigger([
																`materials.${index}.code`,
																`materials.${index}.name`,
																`materials.${index}.purchase_price`,
																`materials.${index}.unit_consumption`,
															]);

															// Only collapse if validation passes
															if (isValid) {
																setCollapsedMaterials((prev) => {
																	const next = [...prev];
																	next[index] = true;
																	return next;
																});
															}
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
						<div className='grid gap-4 md:grid-cols-2 justify-end'>
							<div></div> {/* Empty div for spacing */}
							<FormField
								control={form.control}
								name='percent_pieces_lost'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Percent Pieces Lost (%)</FormLabel>
										<FormControl>
											<Input
												type='number'
												min='0'
												max='100'
												step='any'
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
						<div className='flex justify-end items-center'>
							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<span>Total Raw Material Cost:</span>
								<span>
									R${' '}
									{(() => {
										const baseCost = form.watch('materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
										const percentLost = form.watch('percent_pieces_lost') || 0;
										return (baseCost * (1 + percentLost / 100)).toFixed(2);
									})()}
								</span>
							</div>
						</div>

						{/* Update the packaging materials section */}
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<FormLabel>Packaging Materials</FormLabel>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => {
										form.setValue('packaging_materials', [
											...(form.getValues('packaging_materials') || []),
											{
												code: '',
												name: '',
												purchase_price: 0,
												unit_consumption: 0,
												units: '',
												total_cost: 0,
											},
										]);
										setCollapsedPackagingMaterials((prev) => [...prev, false]);
									}}
								>
									Add Packaging Material
								</Button>
							</div>

							{(form.watch('packaging_materials') || []).map((material, index) => (
								<Card
									key={index}
									className='cursor-pointer'
									onClick={() => {
										if (collapsedPackagingMaterials[index]) {
											setCollapsedPackagingMaterials((prev) => {
												const next = [...prev];
												next[index] = false;
												return next;
											});
										}
									}}
								>
									<CardContent className='pt-6'>
										{collapsedPackagingMaterials[index] ? (
											<div className='grid grid-cols-3 gap-4'>
												<div>
													<FormLabel className='text-sm'>Material Code</FormLabel>
													<p className='mt-1'>{material.code || '-'}</p>
												</div>
												<div>
													<FormLabel className='text-sm'>Material Name</FormLabel>
													<p className='mt-1'>{material.name || '-'}</p>
												</div>
												<div>
													<FormLabel className='text-sm'>Unit Consumption</FormLabel>
													<p className='mt-1'>{material.unit_consumption || '-'}</p>
												</div>
											</div>
										) : (
											<>
												<div className='grid gap-4 md:grid-cols-3'>
													<FormField
														control={form.control}
														name={`packaging_materials.${index}.code`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Material Code</FormLabel>
																<FormControl>
																	<ComboboxFormField
																		options={packagingMaterialOptions.codes}
																		value={field.value}
																		onChange={(value) => handlePackagingMaterialCodeChange(form, packagingMaterials, index, value)}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name={`packaging_materials.${index}.name`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Material Name</FormLabel>
																<FormControl>
																	<ComboboxFormField
																		options={packagingMaterialOptions.names}
																		value={field.value}
																		onChange={(value) => handlePackagingMaterialNameChange(form, packagingMaterials, index, value)}
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
																	<div className='relative'>
																		<span className='absolute right-3 top-1/2 -translate-y-1/2'>R$</span>
																		<Input
																			type='number'
																			step='0.01'
																			className='pr-8'
																			{...field}
																			onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
																			onBlur={(e) => {
																				const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
																				field.onChange(value);
																				field.onBlur();
																			}}
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
																		type='number'
																		step='0.01'
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
																const totalCost = Number((purchasePrice * unitConsumption).toFixed(2));
																field.onChange(totalCost);
															}, [purchasePrice, unitConsumption, index, form]);

															return (
																<FormItem>
																	<FormLabel>Total Cost</FormLabel>
																	<FormControl>
																		<div className='relative'>
																			<span className='absolute right-3 top-1/2 -translate-y-1/2'>R$</span>
																			<Input type='number' step='0.01' className='pr-8' {...field} value={field.value || 0} disabled />
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															);
														}}
													/>
												</div>

												<div className='flex gap-2 mt-4'>
													<Button
														type='button'
														variant='destructive'
														size='sm'
														onClick={(e) => {
															e.stopPropagation();
															const materials = form.getValues('packaging_materials');
															if (materials) {
																materials.splice(index, 1);
																form.setValue('packaging_materials', materials);
																setCollapsedPackagingMaterials((prev) => {
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
														type='button'
														variant='secondary'
														size='sm'
														onClick={async (e) => {
															e.stopPropagation();

															// Validate just this packaging material's fields
															const isValid = await form.trigger([
																`packaging_materials.${index}.code`,
																`packaging_materials.${index}.name`,
																`packaging_materials.${index}.purchase_price`,
																`packaging_materials.${index}.unit_consumption`,
															]);

															// Only collapse if validation passes
															if (isValid) {
																setCollapsedPackagingMaterials((prev) => {
																	const next = [...prev];
																	next[index] = true;
																	return next;
																});
															}
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
						<div className='flex justify-end items-center'>
							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<span>Total Packaging Material Cost:</span>
								<span>
									R${' '}
									{form
										.watch('packaging_materials')
										?.reduce((sum, material) => sum + (material.total_cost || 0), 0)
										.toFixed(2)}
								</span>
							</div>
						</div>

						{/* Add the total material cost summary */}
						<div className='flex justify-end items-center border-t pt-2'>
							<div className='flex items-center gap-2 font-medium'>
								<span>Total Material Cost:</span>
								<span>
									R${' '}
									{(() => {
										const rawMaterialCost = (() => {
											const baseCost = form.watch('materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
											const percentLost = form.watch('percent_pieces_lost') || 0;
											return baseCost * (1 + percentLost / 100);
										})();
										const packagingCost = form.watch('packaging_materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
										const totalMaterialCost = rawMaterialCost + packagingCost;

										// Calculate total labor cost
										const laborCost = form.watch('labor')?.reduce((sum, labor) => sum + (labor.total_cost || 0), 0) || 0;

										// Get general expenses
										const generalExpenses = form.watch('general_expenses') || 0;

										// Calculate final total
										const totalCost = totalMaterialCost + laborCost + generalExpenses;

										return totalCost.toFixed(2);
									})()}
								</span>
							</div>
						</div>

						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<FormLabel>Labor</FormLabel>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={() => {
										form.setValue('labor', [
											...(form.getValues('labor') || []),
											{
												task: '',
												time_per_unit: 0,
												conversion: 1,
												rework: 0,
												cost_per_minute: 0,
												total_cost: 0,
											},
										]);
										setCollapsedLabor((prev) => [...prev, false]);
									}}
								>
									Add Labor
								</Button>
							</div>

							{(form.watch('labor') || []).map((labor, index) => (
								<Card
									key={index}
									className='cursor-pointer'
									onClick={() => {
										if (collapsedLabor[index]) {
											setCollapsedLabor((prev) => {
												const next = [...prev];
												next[index] = false;
												return next;
											});
										}
									}}
								>
									<CardContent className='pt-6'>
										{collapsedLabor[index] ? (
											<div className='grid grid-cols-3 gap-4'>
												<div>
													<FormLabel className='text-sm'>Task Name</FormLabel>
													<p className='mt-1'>{labor.task || '-'}</p>
												</div>
												<div>
													<FormLabel className='text-sm'>Time per Unit</FormLabel>
													<p className='mt-1'>{labor.time_per_unit || '-'}</p>
												</div>
												<div>
													<FormLabel className='text-sm'>Cost per Minute</FormLabel>
													<p className='mt-1'>{labor.cost_per_minute || '-'}</p>
												</div>
											</div>
										) : (
											<>
												<div className='grid gap-4 md:grid-cols-2'>
													<FormField
														control={form.control}
														name={`labor.${index}.task`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Task Name</FormLabel>
																<FormControl>
																	<ComboboxFormField
																		options={laborOptions}
																		value={field.value}
																		onChange={(value: string) => {
																			field.onChange(value);
																			handleLaborChange(form, labors, index, value);
																		}}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name={`labor.${index}.time_per_unit`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Time per Unit (minutes)</FormLabel>
																<FormControl>
																	<Input
																		type='number'
																		step='0.01'
																		{...field}
																		onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
														name={`labor.${index}.conversion`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Conversion</FormLabel>
																<FormControl>
																	<Input
																		type='number'
																		step='0.01'
																		{...field}
																		onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
																		onBlur={(e) => {
																			const value = e.target.value === '' ? 1 : Number.parseFloat(e.target.value) || 0;
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
														name={`labor.${index}.rework`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Rework (%)</FormLabel>
																<FormControl>
																	<Input
																		type='number'
																		min='0'
																		max='100'
																		step='0.01'
																		{...field}
																		onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
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
														name={`labor.${index}.cost_per_minute`}
														render={({ field }) => (
															<FormItem>
																<FormLabel>Cost per Minute</FormLabel>
																<FormControl>
																	<div className='relative'>
																		<span className='absolute right-3 top-1/2 -translate-y-1/2'>R$</span>
																		<Input
																			type='number'
																			step='0.01'
																			className='pr-8'
																			{...field}
																			onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
																			onBlur={(e) => {
																				const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
																				field.onChange(value);
																				field.onBlur();
																			}}
																		/>
																	</div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<FormField
														control={form.control}
														name={`labor.${index}.total_cost`}
														render={({ field }) => {
															// Watch for changes in dependencies
															const timePerUnit = form.watch(`labor.${index}.time_per_unit`) || 0;
															const costPerMinute = form.watch(`labor.${index}.cost_per_minute`) || 0;
															const rework = form.watch(`labor.${index}.rework`) || 0;
															const conversion = form.watch(`labor.${index}.conversion`) || 1;

															// Calculate and update total cost whenever dependencies change
															React.useEffect(() => {
																const totalCost = Number((timePerUnit * costPerMinute * (1 + rework / 100) * (1 / Math.max(0.0001, conversion))).toFixed(2));
																field.onChange(totalCost);
															}, [timePerUnit, costPerMinute, rework, conversion, index, form]);

															return (
																<FormItem>
																	<FormLabel>Total Cost</FormLabel>
																	<FormControl>
																		<div className='relative'>
																			<span className='absolute right-3 top-1/2 -translate-y-1/2'>R$</span>
																			<Input type='number' step='0.01' className='pr-8' {...field} value={field.value || 0} disabled />
																		</div>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															);
														}}
													/>
												</div>

												<div className='flex gap-2 mt-4'>
													<Button
														type='button'
														variant='destructive'
														size='sm'
														onClick={(e) => {
															e.stopPropagation();
															const labor = form.getValues('labor');
															if (labor) {
																labor.splice(index, 1);
																form.setValue('labor', labor);
																setCollapsedLabor((prev) => {
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
														type='button'
														variant='secondary'
														size='sm'
														onClick={async (e) => {
															e.stopPropagation();

															// Validate just this labor's fields
															const isValid = await form.trigger([
																`labor.${index}.task`,
																`labor.${index}.time_per_unit`,
																`labor.${index}.cost_per_minute`,
																`labor.${index}.conversion`,
																`labor.${index}.rework`,
															]);

															// Only collapse if validation passes
															if (isValid) {
																setCollapsedLabor((prev) => {
																	const next = [...prev];
																	next[index] = true;
																	return next;
																});
															}
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

						<div className='flex justify-end items-center'>
							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<span>Total Labor Cost:</span>
								<span>
									R${' '}
									{form
										.watch('labor')
										?.reduce((sum, labor) => sum + (labor.total_cost || 0), 0)
										.toFixed(2)}
								</span>
							</div>
						</div>

						{/* Add General Expenses and Royalties fields */}
						<div className='grid gap-4 md:grid-cols-2 mt-4'>
							<FormField
								control={form.control}
								name='general_expenses'
								render={({ field }) => (
									<FormItem>
										<FormLabel>General Expenses</FormLabel>
										<FormControl>
											<div className='relative'>
												<span className='absolute right-3 top-1/2 -translate-y-1/2'>R$</span>
												<Input
													type='number'
													step='0.01'
													className='pr-8'
													{...field}
													onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
													onBlur={(e) => {
														const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
														field.onChange(value);
														field.onBlur();
													}}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='royalties'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Royalties (%)</FormLabel>
										<FormControl>
											<Input
												type='number'
												min='0'
												max='100'
												step='any'
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

						{/* Add Total Cost Display */}
						<div className='flex justify-end items-center border-t pt-4'>
							<div className='flex items-center gap-2 text-lg font-semibold'>
								<span>Total Cost:</span>
								<span>
									R${' '}
									{(() => {
										// Calculate total material cost (raw + packaging, including losses)
										const rawMaterialCost = (() => {
											const baseCost = form.watch('materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
											const percentLost = form.watch('percent_pieces_lost') || 0;
											return baseCost * (1 + percentLost / 100);
										})();
										const packagingCost = form.watch('packaging_materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
										const totalMaterialCost = rawMaterialCost + packagingCost;

										// Calculate total labor cost
										const laborCost = form.watch('labor')?.reduce((sum, labor) => sum + (labor.total_cost || 0), 0) || 0;

										// Get general expenses
										const generalExpenses = form.watch('general_expenses') || 0;

										const royalties = form.watch('royalties') || 0;
										const sellingPrice = form.watch('selling_price') || 0;

										// Calculate final total
										const totalCost = totalMaterialCost + laborCost + generalExpenses + (royalties / 100) * sellingPrice;

										return totalCost.toFixed(2);
									})()}
								</span>
							</div>
						</div>

						{/* Add Selling Price field */}
						<div className='grid gap-4 md:grid-cols-2 mt-4'>
							<FormField
								control={form.control}
								name='selling_price'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Selling Price *</FormLabel>
										<FormControl>
											<div className='relative'>
												<span className='absolute right-3 top-1/2 -translate-y-1/2'>R$</span>
												<Input
													type='number'
													step='0.01'
													className='pr-8'
													{...field}
													onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseFloat(e.target.value))}
													onBlur={(e) => {
														const value = e.target.value === '' ? 0 : Number.parseFloat(e.target.value) || 0;
														field.onChange(value);
														field.onBlur();
													}}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Updated Profit Margin Display */}
							<div className='flex justify-end items-end'>
								<div className='flex items-center gap-2 text-base'>
									<span className='font-medium'>Profit Margin:</span>
									<span className='font-semibold'>
										{(() => {
											const totalCost = (() => {
												const rawMaterialCost = (() => {
													const baseCost = form.watch('materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
													const percentLost = form.watch('percent_pieces_lost') || 0;
													return baseCost * (1 + percentLost / 100);
												})();
												const packagingCost = form.watch('packaging_materials')?.reduce((sum, material) => sum + (material.total_cost || 0), 0) || 0;
												const laborCost = form.watch('labor')?.reduce((sum, labor) => sum + (labor.total_cost || 0), 0) || 0;
												const generalExpenses = form.watch('general_expenses') || 0;
												return rawMaterialCost + packagingCost + laborCost + generalExpenses;
											})();

											const sellingPrice = form.watch('selling_price') || 0;
											if (totalCost === 0 || sellingPrice === 0) return '0.00%';

											const profitMargin = ((sellingPrice - totalCost) / sellingPrice) * 100;
											return `${profitMargin.toFixed(2)}%`;
										})()}
									</span>
								</div>
							</div>
						</div>

						{/* Add Technical Drawing PDF Upload */}
						<div className='mt-4'>
							<FormField
								control={form.control}
								name='technical_sheet'
								render={({ field: { value, onChange, ...field } }) => (
									<FormItem>
										<FormLabel>Technical Sheet (PDF)</FormLabel>
										<FormControl>
											<div className='relative'>
												<Input
													type='file'
													accept='.pdf'
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file && file.type === 'application/pdf') {
															onChange(file);
														}
													}}
													{...field}
												/>
												{value && (
													<Button
														type='button'
														variant='ghost'
														size='sm'
														className='absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-muted-foreground hover:text-foreground'
														onClick={(e) => {
															e.preventDefault();
															onChange(null);
															// Reset the file input
															const fileInput = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
															if (fileInput) {
																fileInput.value = '';
															}
														}}
													>
														Remove
													</Button>
												)}
											</div>
										</FormControl>
										<FormDescription>Upload technical sheet in PDF format</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className='grid gap-4 md:grid-cols-3'>
							<FormField
								control={form.control}
								name='weight'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Weight (kg) *</FormLabel>
										<FormControl>
											<Input
												type='number'
												step='0.01'
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
								name='width'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Width (cm) *</FormLabel>
										<FormControl>
											<Input
												type='number'
												step='0.01'
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
								name='height'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Height (cm) *</FormLabel>
										<FormControl>
											<Input
												type='number'
												step='0.01'
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
								name='total_units'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Total Units *</FormLabel>
										<FormControl>
											<Input
												type='number'
												min='1'
												step='1'
												{...field}
												onChange={(e) => field.onChange(e.target.value === '' ? '' : Number.parseInt(e.target.value))}
												onBlur={(e) => {
													const value = e.target.value === '' ? 1 : Number.parseInt(e.target.value) || 1;
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
							name='status'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Select status' />
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
					</FormContainer>
				</Form>
			</div>
		</div>
	);
}
