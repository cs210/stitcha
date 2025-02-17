import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';

export default function ProductPage() {
	return (
		<>
			<HeaderContainer>
				<Header text='Products' />
				<Description text='Explore a comprehensive overview of our products, including features, specifications, and benefits to help you make informed decisions.' />
			</HeaderContainer>
		</>
	);
}
