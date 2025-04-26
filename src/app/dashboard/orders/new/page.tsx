'use client';

import { FormContainer } from '@/components/custom/form/form-container';
import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
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
import { Button } from '@/components/ui/button';

const formSchema = z.object({
	client: z.string().min(2).max(50),
	contact: z.string().email({ message: 'Invalid email address' }),
	order_quantity: z.coerce.number().min(1),
	due_date: z.date(),
	product_ids: z.array(z.string().uuid({ message: 'Must be a valid UUID' })).min(1, { message: 'Select at least one product' }),
});

export default function Page() {
	const { user } = useUser();
	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(true);
	const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
	const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			client: '',
			contact: '',
			order_quantity: 0,
			due_date: new Date(),
			product_ids: [],
		},
	});

	useEffect(() => {
		async function fetchOrder() {
			try {
				const response = await fetch('/api/products');

				const { data, error } = await response.json();

				if (!error && data) {
					setProducts(data);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}

		fetchOrder();
	}, [user]);

	async function onSubmit(values: z.infer<typeof formSchema>) {

		console.log("VALUES", values);
		console.log("SELECTED PRODUCTS", selectedProducts);
		
		try {
			const response = await fetch('/api/orders/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					client: values.client,
					contact: values.contact,
					order_quantity: values.order_quantity,
					due_date: values.due_date,
					product_ids: selectedProducts,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to create order');
			}

			form.reset();
			setSelectedProducts([]);

			toast.success('Order created successfully');

			router.push('/dashboard/orders');
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}

	}

	const handleProductSelect = (productId: string) => {
		if (selectedProducts.includes(productId)) {
			setSelectedProducts(selectedProducts.filter(id => id !== productId));
		} else {
			setSelectedProducts([...selectedProducts, productId]);
		}
		form.setValue('product_ids', selectedProducts);
	};

	if (loading) {
		return (
			<LoaderContainer>
				<Loader />
			</LoaderContainer>
		);
	}

	return (
		<>
			<HeaderContainer>
				<Header text='Orders' />
				<Description text='Manage and track customer orders.' />
			</HeaderContainer>

			<div className='py-4'>
				<Form {...form}>
					<FormContainer onSubmit={form.handleSubmit(onSubmit)}>
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
							name='product_ids'
							render={() => (
								<FormItem className='col-span-2'>
									<FormLabel>Products</FormLabel>
									<FormDescription>Select one or more products for this order.</FormDescription>
									<div className='space-y-2'>
										{products.map((product) => (
											<div key={product.id} className='flex items-center gap-2'>
												<Button
													type='button'
													variant={selectedProducts.includes(product.id) ? 'default' : 'outline'}
													onClick={() => handleProductSelect(product.id)}
													className='w-full justify-start'
												>
													{product.name}
												</Button>
											</div>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</FormContainer>					
				</Form>
			</div>
		</>
	);
}

