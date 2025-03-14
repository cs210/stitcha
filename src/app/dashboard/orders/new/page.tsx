'use client';

import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
	client: z.string().min(2).max(50),
	contact: z.string().email({ message: 'Invalid email address' }),
	order_quantity: z.coerce.number().min(1),
	due_date: z.date(),
	product_id: z.string().uuid({ message: 'Must be a valid UUID' }),
});

export default function Page() {
	const { user } = useUser();
	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(false);
	const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			client: '',
			contact: '',
			order_quantity: 0,
			due_date: new Date(),
			product_id: '',
		},
	});

	useEffect(() => {
		if (!user) return;

		// Anonymous function to fetch products from Supabase
		(async () => {
			setLoading(true);

			const response = await fetch('/api/products');

			const { data, error } = await response.json();

			if (!error && data) {
				setProducts(data);

				// If products are available, set the first product as default
				if (data.length > 0) {
					form.setValue('product_id', data[0].id);
				}
			}

			setLoading(false);
		})();
	}, [user, form]);

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Show loading state while submitting
		setLoading(true);

		try {
			// Post the form values to the API
			const response = await fetch('/api/orders/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create order');
			}

			// Reset form after successful submission
			form.reset();

			// Show success message and redirect
			toast.success('Order created successfully');

			router.push('/dashboard/orders');
		} catch (error) {
			console.error(error);
			// toast.error(error);
		} finally {
			setLoading(false);
		}
	}

	// Loading state
	if (loading) return <Loader />;

	return (
		<>
			<HeaderContainer>
				<Header text='Orders' />
				<Description text='Manage and track customer orders.' />
			</HeaderContainer>

			<div className='py-4'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>
						<div className='grid grid-cols-2 gap-6'>
							<FormField
								control={form.control}
								name='client'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Client</FormLabel>
										<FormControl>
											<Input placeholder='Client Name' {...field} />
										</FormControl>
										<FormDescription>This is the name of the client.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='contact'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contact Email</FormLabel>
										<FormControl>
											<Input placeholder='Contact Email' {...field} />
										</FormControl>
										<FormDescription>This is the email address of the client.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='order_quantity'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Order Quantity</FormLabel>
										<FormControl>
											<Input type='number' placeholder='Order Quantity' {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
										</FormControl>
										<FormDescription>This is the quantity of the order.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='due_date'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Due Date</FormLabel>
										<FormControl>
											<Input
												type='date'
												placeholder='Due Date'
												{...field}
												value={field.value ? field.value.toISOString().split('T')[0] : ''}
												onChange={(e) => {
													const date = new Date(e.target.value);
													if (!isNaN(date.getTime())) {
														field.onChange(date);
													}
												}}
											/>
										</FormControl>
										<FormDescription>This is the due date for the order.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='product_id'
								render={({ field }) => (
									<FormItem className='col-span-2'>
										<FormLabel>Product</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select a product' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{products.map((product) => (
													<SelectItem key={product.id} value={product.id}>
														{product.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormDescription>This is the ID of the product.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button type='submit'>Submit</Button>
					</form>
				</Form>
			</div>
		</>
	);
}
