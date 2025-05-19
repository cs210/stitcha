'use client';

import { P } from '@/components/custom/text/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Product, User } from '@/lib/schemas/global.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
	seamstress: z.string(),
	units: z.number().min(1),
	description: z.string().optional(),
});

export function ProductsSeamstresses({ dict, product }: { dict: any, product: Product }) {
	const { toast } = useToast();
		
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
		}
		
		form.reset();

		toast({
			title: 'Seamstress assigned.',
			description: 'Seamstress assigned to product successfully.',
		});
	}

	const handleRemoveSeamstress = async (seamstressId: string) => {
		const response = await fetch(`/api/products/${product.id}/seamstresses/${seamstressId}`, {
			method: 'DELETE',
		});
		const { data, error } = await response.json();

		if (error) {
			console.error('Error removing seamstress:', error);
		}

		toast({
			title: 'Seamstress removed.',
			description: 'Seamstress removed from product successfully.',
		});
	}

	return (
		<>
			<div className='flex flex-row gap-2'>
				<Popover>
					<PopoverTrigger asChild>
						<Button className='mb-4'>Assign Seamstress</Button>
					</PopoverTrigger>
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
														<SelectValue placeholder='Assign a seamstress' />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{seamstresses.map((seamstress: User) => (
														<SelectItem key={seamstress.id} value={seamstress.id}>
															<div className='flex items-center gap-2'>
																<Avatar className='h-8 w-8'>
																	<AvatarImage src={seamstress.image_url ?? ''} />
																	<AvatarFallback>
																		{seamstress.first_name.charAt(0)} {seamstress.last_name.charAt(0)}
																	</AvatarFallback>
																</Avatar>
																<P>
																	{seamstress.first_name} {seamstress.last_name}
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
									control={form.control}
									name='units'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Units</FormLabel>
											<FormControl>
												<Input type='number' {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
				<Button variant='outline'>Send Whatsapp Message</Button>
			</div>

			{product.users && product.users.length > 0 ? (
				<ScrollArea className='h-24 w-full rounded-md border'>
					<div className='p-2'>
						{product.users.map((user: User, index: number) => (
							<div key={user.id}>
								<div className='flex items-center justify-between p-1'>
									<Link href={`/dashboard/seamstresses/${user.id}`} className='flex items-center gap-2'>
										<Avatar>
											<AvatarImage src={user.image_url ?? ''} />
												<AvatarFallback>
													{user.first_name.charAt(0)} {user.last_name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<P>
												{user.first_name} {user.last_name}
											</P>
									</Link>
									<Button size='icon' onClick={() => handleRemoveSeamstress(user.id)}>
										<X className='w-4 h-4 cursor-pointer' />
									</Button>
								</div>
								{index !== product.users.length - 1 && <Separator className='my-2' />}
							</div>
						))}
					</div>
				</ScrollArea>
			) : (
				<P>No seamstresses assigned to this product</P>
			)}
		</>
	);
}
