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
import { removeSeamstressFromProduct } from '@/lib/utils/product';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const assignSeamstressFormSchema = z.object({
	seamstress: z.string({ required_error: 'Seamstress is required' }),
	units: z.number().min(1, { message: 'Units must be at least 1' }),
	description: z.string().optional(),
});

const sendWhatsappMessageFormSchema = z.object({
	seamstress: z.string({ required_error: 'Seamstress is required' }),
	phone_number: z.string({ required_error: 'Phone number is required' })
		.regex(/^\d+$/, 'Phone number must contain only digits'),
	message: z.string({ required_error: 'Message is required' }),
});

// The seamstress section for each individual product
export function ProductsSeamstresses({ dict, product }: { dict: any, product: Product }) {
	const { toast } = useToast();
		
	const [seamstresses, setSeamstresses] = useState<User[]>([]);
	const [assignedSeamstresses, setAssignedSeamstresses] = useState<User[]>([]);

	const assignSeamstressForm = useForm<z.infer<typeof assignSeamstressFormSchema>>({
		resolver: zodResolver(assignSeamstressFormSchema),
		defaultValues: {			
			units: 1,
			description: '',
		},
	});

	const sendWhatsappMessageForm = useForm<z.infer<typeof sendWhatsappMessageFormSchema>>({
		resolver: zodResolver(sendWhatsappMessageFormSchema),
		defaultValues: {
			seamstress: '',
			phone_number: '',
			message: ''
		}
	});
	
	useEffect(() => {
		(async () => {
			try {
				const response = await fetch('/api/seamstresses');
				const { data, error } = await response.json();

				if (!error) {				
					const filteredSeamstresses = data.filter((seamstress: User) => 
						!product.users?.some((assignedSeamstress: User) => 
							assignedSeamstress.id === seamstress.id
						)
					);

					setSeamstresses(filteredSeamstresses);
				}

				setAssignedSeamstresses(product.users);
			} catch (error) {
				// toast({
				// 	title: dict.adminsSection.product.notifications.seamstressesLoading.error.title,
				// 	description: dict.adminsSection.product.notifications.seamstressesLoading.error.description,
				// 	variant: 'destructive',
				// });
			}
		})();
	}, []);

	// Assign a seamstress to a product
	async function onAssignSeamstressSubmit(values: z.infer<typeof assignSeamstressFormSchema>) {	
		try {
			const formData = new FormData();

			formData.append('seamstress', values.seamstress);
			formData.append('units', values.units.toString());
			formData.append('description', values.description ?? '');

			const response = await fetch(`/api/products/${product.id}/seamstresses`, {
				method: 'POST',
				body: formData,
			});
			const { data, error } = await response.json();

			if (error) {
				throw new Error(error);
			}

			setAssignedSeamstresses(data);

			// toast({
			// 	title: dict.adminsSection.product.seamstresses.seamstressAssigned,
			// 	description: dict.adminsSection.product.seamstresses.seamstressAssignedDescription,
			// });
		} catch (error) {
			// toast({
			// 	title: dict.adminsSection.product.seamstresses.seamstressAssigned.error.title,
			// 	description: dict.adminsSection.product.seamstresses.seamstressAssigned.error.description,
			// 	variant: 'destructive',
			// });
		}
	}

	// Send a WhatsApp message to a seamstress
	const onWhatsappMessageSubmit = async (values: z.infer<typeof sendWhatsappMessageFormSchema>) => {
		try {
			// Remove any non-digit characters from phone number
			const cleanPhoneNumber = values.phone_number.replace(/\D/g, '');
			
			// Properly encode the message for URL
			const encodedMessage = encodeURIComponent(values.message.trim());
			
			// Construct WhatsApp URL with proper formatting
			const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
			
			// Open WhatsApp in a new tab
			window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

			// Reset form after successful submission
			sendWhatsappMessageForm.reset();
		} catch (error) {
			// toast({
			// 	title: dict.adminsSection.product.seamstresses.sendWhatsappMessage.notifications.error.title,
			// 	description: dict.adminsSection.product.seamstresses.sendWhatsappMessage.notifications.error.description,
			// 	variant: 'destructive'
			// });
		}
	};

	return (
		<>
			<div className='flex flex-row gap-2'>
				<Popover>
					<PopoverTrigger asChild>
						<Button className='mb-4'>{dict.adminsSection.products.product.seamstresses.assignSeamstressForm.title}</Button>
					</PopoverTrigger>
					<PopoverContent>
						<Form {...assignSeamstressForm}>
							<form onSubmit={assignSeamstressForm.handleSubmit(onAssignSeamstressSubmit)} className='space-y-8'>
								<FormField
									control={assignSeamstressForm.control}
									name='seamstress'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{dict.adminsSection.products.product.seamstresses.assignSeamstressForm.seamstress.label}</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder={dict.adminsSection.products.product.seamstresses.assignSeamstressForm.seamstress.placeholder} />
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
									control={assignSeamstressForm.control}
									name='units'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{dict.adminsSection.products.product.seamstresses.assignSeamstressForm.units.label}</FormLabel>
											<FormControl>
												<Input type='number' min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={assignSeamstressForm.control}
									name='description'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{dict.adminsSection.products.product.seamstresses.assignSeamstressForm.description.label}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={dict.adminsSection.products.product.seamstresses.assignSeamstressForm.description.placeholder} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type='submit'>{dict.general.form.submit}</Button>
							</form>
						</Form>
					</PopoverContent>
				</Popover>
				<Popover>
					<PopoverTrigger asChild>
						<Button className='mb-4'>{dict.adminsSection.products.product.seamstresses.sendWhatsappMessage.title}</Button>
					</PopoverTrigger>
					<PopoverContent>
						<Form {...sendWhatsappMessageForm}>
							<form onSubmit={sendWhatsappMessageForm.handleSubmit(onWhatsappMessageSubmit)} className='space-y-8'>
								<FormField
									control={sendWhatsappMessageForm.control}
									name='seamstress'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{dict.adminsSection.products.product.seamstresses.sendWhatsappMessage.seamstress.label}</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder={dict.adminsSection.products.product.seamstresses.sendWhatsappMessage.seamstress.placeholder} />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{assignedSeamstresses.map((seamstress: User) => (
														<SelectItem key={seamstress.id} value={seamstress.phone_number || ''}>
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
									control={sendWhatsappMessageForm.control}
									name='phone_number'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{dict.adminsSection.products.product.seamstresses.sendWhatsappMessage.phone_number?.label || 'Phone Number'}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={dict.adminsSection.products.product.seamstresses.sendWhatsappMessage.phone_number?.placeholder || 'Enter phone number with country code'} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={sendWhatsappMessageForm.control}
									name='message'
									render={({ field }) => (
										<FormItem>
											<FormLabel>{dict.adminsSection.products.product.seamstresses.sendWhatsappMessage.message.label}</FormLabel>
											<FormControl>
												<Input {...field} placeholder={dict.adminsSection.products.product.seamstresses.sendWhatsappMessage.message.placeholder} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type='submit'>{dict.general.form.submit}</Button>
							</form>
						</Form>
					</PopoverContent>
				</Popover>
			</div>

			{assignedSeamstresses && assignedSeamstresses.length > 0 ? (
				<ScrollArea className='h-24 w-full rounded-md border'>
					<div className='p-2'>
						{assignedSeamstresses.map((seamstress: User, index: number) => (
							<div key={seamstress.id}>
								<div className='flex items-center justify-between p-1'>
									<Link href={`/dashboard/seamstresses/${seamstress.id}`} className='flex items-center gap-2'>
										<Avatar>
											<AvatarImage src={seamstress.image_url ?? ''} />
											<AvatarFallback>
												{seamstress.first_name.charAt(0)} {seamstress.last_name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<P>
											{seamstress.first_name} {seamstress.last_name}
										</P>
									</Link>
									<Button size='icon' variant='ghost' onClick={() => {
										removeSeamstressFromProduct(product, seamstress.id, setAssignedSeamstresses);

										// toast({
										// 	title: dict.adminsSection.product.seamstresses.seamstressRemoved,
										// 	description: dict.adminsSection.product.seamstresses.seamstressRemovedDescription,
										// 	variant: 'destructive',
										// });
									}}>
										<X className='w-4 h-4 cursor-pointer' />
									</Button>
								</div>
								{index !== assignedSeamstresses.length - 1 && <Separator className='my-2' />}
							</div>
						))}
					</div>
				</ScrollArea>
			) : (
				<P>{dict.adminsSection.products.product.seamstresses.noSeamstressesAssigned}</P>
			)}
		</>
	);
}
