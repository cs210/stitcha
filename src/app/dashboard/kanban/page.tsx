'use client';

import { LangContext } from '@/app/layout';
import { Container } from '@/components/custom/container/container';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { KanbanBoard } from '@/components/custom/kanban/kanban';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { H2 } from '@/components/custom/text/headings';
import { P } from '@/components/custom/text/text';
import { useContext, useEffect, useState } from 'react';
import { getDictionary } from '../../locales';

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
