'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useTheme } from 'next-themes';

const formSchema = z.object({
	language: z.string({
		required_error: 'Please select a language.',
	}),
	theme: z.string({
		required_error: 'Please select a theme.',
	}),
});

export default function SettingsPage() {
	const { setTheme } = useTheme();
	// const { theme, setTheme } = useTheme();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			language: 'en',
			theme: 'light',
			// theme: theme, // TODO: this is causing a hydration issue
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		setTheme(values.theme);
	}

	return (
		<>
			<HeaderContainer>
				<Header text='Settings' />
				<Description text='Manage your preferences, account details, and application settings to tailor your experience.' />
			</HeaderContainer>
			<div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='w-2/3 space-y-6'>
						<FormField
							control={form.control}
							name='language'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Language</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Please select a language' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value='en'>English</SelectItem>
											<SelectItem value='pt-br'>Portugese</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>Please pick a language.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='theme'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Theme</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Please select a theme' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value='light'>Light</SelectItem>
											<SelectItem value='dark'>Dark</SelectItem>
											<SelectItem value='system'>System</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>Please pick a theme.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type='submit'>Submit</Button>
					</form>
				</Form>
			</div>
		</>
	);
}
