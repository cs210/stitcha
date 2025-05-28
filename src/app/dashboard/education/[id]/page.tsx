'use client';

import { HeaderContainer } from '@/components/custom/containers/header-container';
import { Loader } from '@/components/custom/loader/loader';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { useToast } from '@/hooks/use-toast';
import { LangContext } from '@/lib/lang/LangContext';
import { getDictionary } from '@/lib/lang/locales';
import { Education } from '@/lib/schemas/global.types';
import { use, useContext, useEffect, useState } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id: educationId } = use(params);
	const { lang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const { toast } = useToast();

	const [education, setEducation] = useState<Education | null>(null);

	useEffect(() => {
		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);

			const educationResponse = await fetch(`/api/education/${educationId}`);
			const { data, error } = await educationResponse.json();

			if (!error) {
				setEducation(data);
			} else {
				// toast({
				// 	title: dict.product.seamstresses.seamstressRemoved,
				// 	description: dict.product.seamstresses.seamstressRemovedDescription,
				// 	variant: 'destructive',
				// });
			}

			setLoading(false);
		})();
	}, [educationId, lang]);

	if (loading) return <Loader />;

	return (
		<>
			<HeaderContainer>
				<H2>{education?.name}</H2>
			</HeaderContainer>

			<div className='flex flex-col justify-center items-center gap-4 mt-4'>
				<video 
					src={education?.video_url} 
					controls 
					className="w-96 h-96 rounded-md"
					poster={education?.thumbnail_url}
				/>
				<P>{education?.description}</P>
				<P>{education?.duration} {dict.general.time.minutes}</P>
			</div>
		</>
	);
}
