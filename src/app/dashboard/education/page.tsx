'use client';

import { Container } from '@/components/custom/containers/container';
import { HeaderContainer } from '@/components/custom/containers/header-container';
import { EducationCard } from '@/components/custom/education/education-card';
import { Loader } from '@/components/custom/loader/loader';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { useToast } from '@/hooks/use-toast';
import { LangContext } from '@/lib/lang/LangContext';
import { getDictionary } from '@/lib/lang/locales';
import { Education } from '@/lib/schemas/global.types';
import { useContext, useEffect, useState } from 'react';

export default function Page() {
	const { lang, setLang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const { toast } = useToast();

	const [education, setEducation] = useState<Education[]>([]);

	useEffect(() => {
		(async () => {
			try {
				const dict = await getDictionary(lang);

				setDict(dict);

				const response = await fetch('/api/education');
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error);
				}

				setEducation(result.data);
				setLoading(false);
			} catch (error) {
				// toast({
				// 	title: dict.products.notifcations.error,
				// 	description: dict.products.notifcations.errorDescription,
				// 	variant: 'destructive',
				// });
			}
		})();
	}, [lang]);

	if (loading) return <Loader />;

	return (
		<>
			<HeaderContainer>
				<H2>{dict.seamstressesSection.education.title}</H2>
				<P className='mt-2'>{dict.seamstressesSection.education.description}</P>
			</HeaderContainer>

			<Container>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					{education.map((educationItem) => (
						<EducationCard key={educationItem.id} dict={dict} education={educationItem} />
					))}
				</div>
			</Container>
		</>
	);
}
