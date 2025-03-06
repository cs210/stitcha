'use client';

import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { Loader } from '@/components/custom/loader';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
	client: z.string().min(2).max(50),
});

export default function Page() {
	const { user } = useUser();

	const [loading, setLoading] = useState<boolean>(true);

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			client: '',
		},
	});

	useEffect(() => {
		if (!user) return;

		setLoading(false);
	}, [user, form]);

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Show loading state while submitting
		setLoading(true);

		try {
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
						</div>

						<Button type='submit'>Submit</Button>
					</form>
				</Form>
			</div>
		</>
	);
}
