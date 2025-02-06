import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';

export default function PipelinePage() {
	return (
		<>
			<HeaderContainer>
				<Header text='Pipeline' />
				<Description text='Explore our product pipeline for development stages, key milestones, and timelines.' />
			</HeaderContainer>
		</>
	);
}
