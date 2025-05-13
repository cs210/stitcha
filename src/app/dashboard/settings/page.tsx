'use client';

import { getDictionary } from '@/app/locales';
import { Container } from '@/components/custom/container/container';
import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@clerk/nextjs';
import { useContext, useEffect, useState } from 'react';
import { LangContext } from '@/app/layout';

export default function Page() {
	const { user } = useUser();
	const { lang, setLang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const [selectedLanguage, setSelectedLanguage] = useState<string>(lang);

	useEffect(() => {
		if (!user) return;

		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);
			setLoading(false);
		})();
	}, [user, lang]);

	const handleSubmit = () => {				
		if (setLang && selectedLanguage) {
			console.log('selectedLanguage', selectedLanguage);

			setLang(selectedLanguage);
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
		<>
			<HeaderContainer>
				<Header text={dict.settings.title} />
				<Description text={dict.settings.description} />
			</HeaderContainer>

			<Container>
				<div className='space-y-8 w-full'>
					<div className='grid grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label>{dict.settings.form.fullName}</Label>
							<Input value={user?.fullName || ''} disabled />
						</div>
						<div className='space-y-2'>
							<Label>{dict.settings.form.email}</Label>
							<Input value={user?.primaryEmailAddress?.emailAddress || ''} disabled />
						</div>
						<div className='space-y-2'>
							<Label>{dict.settings.form.language.title}</Label>
							<Select defaultValue={lang} onValueChange={(value) => setSelectedLanguage(value)}>
								<SelectTrigger>
									<SelectValue placeholder={dict.settings.form.language.placeholder} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='pt-br'>{dict.settings.form.language.options.pt}</SelectItem>
									<SelectItem value='en'>{dict.settings.form.language.options.en}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Button onClick={handleSubmit}>{dict.settings.form.save}</Button>
				</div>
			</Container>
		</>
	);
}
