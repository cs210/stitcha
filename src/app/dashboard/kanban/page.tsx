'use client';

import { Container } from '@/components/custom/container/container';
import { Description } from '@/components/custom/header/description';
import { Header } from '@/components/custom/header/header';
import { HeaderContainer } from '@/components/custom/header/header-container';
import { KanbanBoard } from '@/components/custom/kanban/kanban';
import { Loader } from '@/components/custom/loader/loader';
import { LoaderContainer } from '@/components/custom/loader/loader-container';
import { useContext, useEffect, useState } from 'react';
import { getDictionary } from '../../locales';
import { LangContext } from '@/app/layout';

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
				<Header text={dict.kanban.title} />
				<Description text={dict.kanban.description} />
			</HeaderContainer>

			<Container>
				<KanbanBoard dict={dict} />
			</Container>
		</>
	);
}
