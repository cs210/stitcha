'use client';

import { Container } from '@/components/custom/containers/container';
import { HeaderContainer } from '@/components/custom/containers/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { H2 } from '@/components/custom/text/headings';
import { RequiredAsterisk } from '@/components/custom/text/required-asterisk';
import { P } from '@/components/custom/text/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LangContext } from '@/lib/lang/LangContext';
import { getDictionary } from '@/lib/lang/locales';
import { Product } from '@/lib/schemas/global.types';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { use, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const progressFormSchema = z.object({
	image_urls: z.array(z.instanceof(File)).min(1, { message: 'At least one product image is required' }).nullable(),
	product: z.string().min(1, { message: 'Product is required' }),
	description: z.string(),
	emotion: z.string().min(1, { message: 'Emotion is required' }),
	units_completed: z.number().min(1, { message: 'Units completed must be at least 1' }),
});

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id: seamstressId } = use(params);
	const { lang, setLang } = useContext(LangContext);
	const { user } = useUser();
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const { toast } = useToast();

	const [products, setProducts] = useState<Product[]>([]);	

	const progressForm = useForm<z.infer<typeof progressFormSchema>>({
		resolver: zodResolver(progressFormSchema),
		defaultValues: {
			image_urls: null,
			product: '',
			description: '',
			emotion: '',
			units_completed: 1,
		},
	});

	useEffect(() => {
		(async () => {
			try {
				const dict = await getDictionary(lang);

				setDict(dict);

				const response = await fetch(`/api/seamstresses/${seamstressId}`);
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				setProducts(result.data.products);
				setLoading(false);
			} catch (error) {
				toast({
					title: dict.general.notifcations.productsLoading.error.title,
					description: dict.general.notifcations.productsLoading.error.description,
					variant: 'destructive',
				});
			}
		})();
	}, [lang]);

	// Create a new progress entry for this seamstress
	const progressFormSubmit = async (values: z.infer<typeof progressFormSchema>) => {
		try {
			const formData = new FormData();

			// Add image files if they exist
			if (values.image_urls) {
				values.image_urls.forEach((file) => {
					formData.append(`image_urls`, file);
				});
			}

			formData.append('product', values.product);
			formData.append('description', values.description);
			formData.append('emotion', values.emotion);
			formData.append('units_completed', values.units_completed.toString());

			const response = await fetch(`/api/seamstresses/${seamstressId}/progress`, {
				method: 'POST',
				body: formData,
			});
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error);
			}

			toast({
				title: dict.general.notifications.progressUploaded.success.title,
				description: dict.general.notifications.progressUploaded.success.description,
			});
		} catch (error) {
			toast({
				title: dict.general.notifications.progressUploaded.error.title,
				description: dict.general.notifications.progressUploaded.error.description,
				variant: 'destructive',
			});
		}
	};

	if (loading) return <Loader />;

	return (
		<>
			<HeaderContainer>
				<H2>{dict.seamstressesSection.progress.title}</H2>
				<P className='mt-2'>{dict.seamstressesSection.progress.description}</P>
			</HeaderContainer>

			<Container>
				<Form {...progressForm}>
					<form onSubmit={progressForm.handleSubmit(progressFormSubmit)} className='space-y-8'>
						<FormField
							control={progressForm.control}
							name='image_urls'
							render={({ field: { value, onChange, ...fieldProps } }) => (
								<FormItem>
									<FormLabel>
										{dict.seamstressesSection.progress.form.imageUrls.label} <RequiredAsterisk />
									</FormLabel>
									<FormControl>
										<div>
											<div className='relative'>
												<div className='flex items-center gap-2'>
													<Button
														type='button'
														variant='outline'
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
														{dict.general.form.imagePicker.chooseImages}
													</Button>
													<span className='text-sm text-muted-foreground'>
														{value && value.length > 0 ? `${value.length} ${value.length === 1 ? dict.general.form.imagePicker.image : dict.general.form.imagePicker.images} ${dict.general.form.imagePicker.selected}` : `${dict.general.form.imagePicker.noImagesSelected}`}
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
													className='hidden'
												/>
											</div>
											<div className='mt-2 space-y-2'>
												{value?.map((file: File, index: number) => (
													<div key={index} className='flex items-center gap-2'>
														<Image src={URL.createObjectURL(file)} alt={file.name} width={100} height={100} />
														<Button
															type='button'
															variant='ghost'
															size='sm'
															onClick={() => {
																const newFiles = value.filter((_: File, i: number) => i !== index);

																onChange(newFiles);

																const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

																if (fileInput) {
																	fileInput.value = '';
																}
															}}
														>
															{dict.general.form.imagePicker.remove}
														</Button>
													</div>
												))}
											</div>
										</div>
									</FormControl>
									<FormDescription>{dict.seamstressesSection.progress.form.imageUrls.description}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={progressForm.control}
							name='product'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{dict.seamstressesSection.progress.form.product.label} <RequiredAsterisk />
									</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder={dict.seamstressesSection.progress.form.product.placeholder} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{products.map((product: Product) => (
												<SelectItem key={product.id} value={product.id}>
													<div className='flex items-center gap-2'>
														<Avatar className='h-8 w-8'>
															<AvatarImage src={product.image_urls?.[0] ?? ''} />
															<AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
														</Avatar>
														<P>{product.name}</P>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>{dict.seamstressesSection.progress.form.product.description}</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={progressForm.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{dict.seamstressesSection.progress.form.description.label}</FormLabel>
									<FormControl>
										<Input {...field} placeholder={dict.seamstressesSection.progress.form.description.placeholder} />
									</FormControl>
									<FormMessage />
									<FormDescription>{dict.seamstressesSection.progress.form.description.description}</FormDescription>
								</FormItem>
							)}
						/>
						<FormField
							control={progressForm.control}
							name='emotion'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{dict.seamstressesSection.progress.form.emotion.label} <RequiredAsterisk />
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder={dict.seamstressesSection.progress.form.emotion.placeholder} />
									</FormControl>
									<FormMessage />
									<FormDescription>{dict.seamstressesSection.progress.form.emotion.description}</FormDescription>
								</FormItem>
							)}
						/>
						<FormField
							control={progressForm.control}
							name='units_completed'
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{dict.seamstressesSection.progress.form.unitsCompleted.label} <RequiredAsterisk />
									</FormLabel>
									<FormControl>
										<Input type='number' min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
									</FormControl>
									<FormMessage />
									<FormDescription>{dict.seamstressesSection.progress.form.unitsCompleted.description}</FormDescription>
								</FormItem>
							)}
						/>

						<Button type='submit'>{dict.general.form.submit}</Button>
					</form>
				</Form>
			</Container>
		</>
	);
}
