'use client';

import { Container } from '@/components/custom/containers/container';
import { HeaderContainer } from '@/components/custom/containers/header-container';
import { LoaderContainer } from '@/components/custom/containers/loader-container';
import { KanbanBoard } from '@/components/custom/kanban/kanban';
import { Loader } from '@/components/custom/loader/loader';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { LangContext } from '@/lib/lang/LangContext';
import { useContext, useEffect, useState } from 'react';
import { getDictionary } from '../../../lib/lang/locales';

export default function Page() {
	const { lang } = useContext(LangContext);
	const [dict, setDict] = useState<any>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const dict = await getDictionary(lang);

			setDict(dict);
			setLoading(false);
		})();
	}, [lang]);

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
				<H2>{dict.kanban.title}</H2>
				<P className='mt-2'>{dict.kanban.description}</P>
			</HeaderContainer>

			<Container>
				<KanbanBoard dict={dict} />
			</Container>
		</>
	);
}
