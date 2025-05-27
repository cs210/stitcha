'use client';

import { Container } from '@/components/custom/containers/container';
import { HeaderContainer } from '@/components/custom/containers/header-container';
import { LoaderContainer } from '@/components/custom/containers/loader-container';
import { Loader } from '@/components/custom/loader/loader';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LangContext } from '@/lib/lang/LangContext';
import { getDictionary } from '@/lib/lang/locales';
import { Product } from '@/lib/schemas/global.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { use, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

const progressFormSchema = z.object({
	product: z.string().min(1, { message: 'Product is required' }),
	description: z.string(),
	emotion: z.string().min(1, { message: 'Emotion is required' }),
	units_completed: z.number().min(1, { message: 'Units completed must be at least 1' }),
});

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id: seamstressId } = use(params);	
	const { lang, setLang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const { toast } = useToast();

	const [products, setProducts] = useState<Product[]>([]);	

	const progressForm = useForm<z.infer<typeof progressFormSchema>>({
		resolver: zodResolver(progressFormSchema),
		defaultValues: {
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

				const response = await fetch('/api/products');
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				setProducts(result.data);
				setLoading(false);
			} catch (error) {
				toast({
					title: dict.products.notifcations.error,
					description: dict.products.notifcations.errorDescription,
					variant: 'destructive',
				});
			}
		})();
	}, [lang]);

	// Create a new progress entry for this seamstress
	const progressFormSubmit = async (values: z.infer<typeof progressFormSchema>) => {
		try {
			const formData = new FormData();

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
				title: dict.progress.notifications.progressUploaded.success.title,
				description: dict.progress.notifications.progressUploaded.success.description,
			});
		} catch (error) {
			toast({
				title: dict.progress.notifications.progressUploaded.error.title,
				description: dict.progress.notifications.progressUploaded.error.description,
				variant: 'destructive',
			});
		}
	};

	if (loading) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	return (
		<div className='max-w-2xl p-8 mx-auto'>
			<HeaderContainer>
				<H2>{dict.progress.title}</H2>
				<P className='mt-2'>{dict.progress.description}</P>
			</HeaderContainer>

			<Container>				
				<Form {...progressForm}>
					<form onSubmit={progressForm.handleSubmit(progressFormSubmit)} className='space-y-8'>					
						<FormField
							control={progressForm.control}
							name='product'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{dict.progress.form.product.label}</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder={dict.progress.form.product.placeholder} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{products.map((product: Product) => (
												<SelectItem key={product.id} value={product.id}>
													<div className='flex items-center gap-2'>
														<Avatar className='h-8 w-8'>
															<AvatarImage src={product.image_urls[0] ?? ''} />
															<AvatarFallback>
																{product.name.charAt(0)}
															</AvatarFallback>
														</Avatar>
														<P>
															{product.name}
														</P>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={progressForm.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{dict.progress.form.description.label}</FormLabel>
									<FormControl>
										<Input {...field} placeholder={dict.progress.form.description.placeholder} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={progressForm.control}
							name='emotion'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{dict.progress.form.emotion.label}</FormLabel>
									<FormControl>
										<Input {...field} placeholder={dict.progress.form.emotion.placeholder} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={progressForm.control}
							name='units_completed'
							render={({ field }) => (
								<FormItem>
									<FormLabel>{dict.progress.form.units_completed.label}</FormLabel>
									<FormControl>
										<Input type='number' min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type='submit'>{dict.progress.form.submit}</Button>
					</form>
				</Form>
			</Container>
		</div>
	);
}
