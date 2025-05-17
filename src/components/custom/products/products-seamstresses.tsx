'use client';

import { H4 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, User } from '@/lib/schemas/global.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
	seamstress: z.string(),
	units: z.number().min(1),
	description: z.string().min(1),
});

export function ProductsSeamstresses({ product }: { product: Product }) {
	const [seamstresses, setSeamstresses] = useState<User[]>([]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			seamstress: '',
			units: 0,
			description: '',
		},
	});

	useEffect(() => {
		(async () => {
			const response = await fetch('/api/seamstresses');
			const { data, error } = await response.json();

			if (!error) {
				setSeamstresses(data);
			}
		})();
	}, []);
	
	async function onSubmit(values: z.infer<typeof formSchema>) {	
		const formData = new FormData();

		formData.append('seamstress', values.seamstress);
		formData.append('units', values.units.toString());
		formData.append('description', values.description);

		const response = await fetch(`/api/products/${product.id}/seamstresses`, {
			method: 'POST',
			body: formData,
		});
		const { data, error } = await response.json();

		if (error) {
			console.error('Error assigning seamstress:', error);

			return;
		}

		form.reset();
	}

	return (
		<div>
			<Popover>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
							<FormField
								control={form.control}
								name='seamstress'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Seamstress</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select a verified email to display' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{seamstresses.map((seamstress) => (
													<SelectItem key={seamstress.id} value={seamstress.id}>
														<Avatar>
															<AvatarImage src={seamstress.image_url ?? ''} />
															<AvatarFallback>
																{seamstress.first_name.charAt(0)} {seamstress.last_name.charAt(0)}
															</AvatarFallback>
														</Avatar>
														{seamstress.first_name} {seamstress.last_name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='units'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Units</FormLabel>
										<FormControl>
											<Input 
												type='number'
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
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
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type='submit'>Submit</Button>
						</form>
					</Form>
				</PopoverContent>
			</Popover>

			<H4>Assigned Seamstresses</H4>			
			{product.users && product.users.length > 0 ? (
				<div className='flex flex-col gap-4'>
					{product.users.map((user: User) => (
						<div key={user.id} className='flex items-center gap-2 p-2'>
							<Avatar>
								<AvatarImage src={user.image_url ?? ''} />
								<AvatarFallback>
									{user.first_name.charAt(0)} {user.last_name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className='flex flex-row gap-2'>
								<P>{user.first_name} {user.last_name}</P>
								<P>{user.validated ? 'Validated' : 'Not Validated'}</P>
								<P>{user.units_completed} units completed</P>
							</div>
						</div>
					))}
				</div>					
			) : (
				<P>No seamstresses assigned to this product</P>
			)}			
		</div>
	);
}
