import { Description } from '@/components/custom/description';
import { Header } from '@/components/custom/header';
import { HeaderContainer } from '@/components/custom/header-container';
import { KanbanBoard } from '@/components/custom/kanban-board';

export default function Page() {
	return (
		<>
			<HeaderContainer>
				<Header text='Kanban' />
				<Description text='Manage and track customer orders' />
			</HeaderContainer>

			<KanbanBoard />
		</>
	);
}
