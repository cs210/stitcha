'use client';

import { Container } from '@/components/custom/containers/container';
import { HeaderContainer } from '@/components/custom/containers/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LangContext } from '@/lib/lang/LangContext';
import { getDictionary } from '@/lib/lang/locales';
import { useUser } from '@clerk/nextjs';
import { useContext, useEffect, useState } from 'react';

export default function Page() {
	const { user } = useUser();
	const { lang, setLang } = useContext(LangContext);	
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const { toast } = useToast();

	const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'pt-br'>(lang as 'en' | 'pt-br');

	useEffect(() => {
		if (!user) return;

		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);
			setLoading(false);
		})();
	}, [user, lang]);

	// Handle language change
	const handleLanguageChange = () => {
		if (setLang && selectedLanguage) {
			setLang(selectedLanguage);

			// toast({
			// 	title: dict.settings.notifications.languageChanged.success.title,
			// 	description: dict.settings.notifications.languageChanged.success.description.replace('{{language}}', selectedLanguage === 'en' ? 'English' : 'Portuguese'),
			// });
		} else {
			// toast({
			// 	title: dict.settings.notifications.languageChanged.error.title,
			// 	description: dict.settings.notifications.languageChanged.error.description,
			// 	variant: 'destructive',
			// });
		}
	};

	if (loading) return <Loader />;

	return (
		<>
			<HeaderContainer>
				<H2>{dict.adminsSection.settings.title}</H2>
				<P className='mt-2'>{dict.adminsSection.settings.description}</P>
			</HeaderContainer>

			<Container>
				<div className='space-y-8 w-full'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label>{dict.adminsSection.settings.form.fullName}</Label>
							<Input value={user?.fullName || ''} disabled />
						</div>
						<div className='space-y-2'>
							<Label>{dict.adminsSection.settings.form.email}</Label>
							<Input value={user?.primaryEmailAddress?.emailAddress || ''} disabled />
						</div>
						<div className='space-y-2'>
							<Label>{dict.adminsSection.settings.form.language.label}</Label>
							<Select defaultValue={lang} onValueChange={(value) => setSelectedLanguage(value as 'en' | 'pt-br')}>
								<SelectTrigger>
									<SelectValue placeholder={dict.adminsSection.settings.form.language.placeholder} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='pt-br'>{dict.adminsSection.settings.form.language.options.pt}</SelectItem>
									<SelectItem value='en'>{dict.adminsSection.settings.form.language.options.en}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Button onClick={handleLanguageChange}>{dict.general.form.submit}</Button>
				</div>
			</Container>
		</>
	);
}
