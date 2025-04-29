import { Description } from "@/components/custom/header/description";
import { Header } from "@/components/custom/header/header";
import { HeaderContainer } from "@/components/custom/header/header-container";
import { KanbanBoard } from "@/components/custom/kanban/kanban";

export default function Page() {
  return (
    <div>
      <HeaderContainer>
        <Header text="Kanban" />
        <Description text="Manage and track order progress" />
      </HeaderContainer>

      <KanbanBoard />
    </div>
  );
}
