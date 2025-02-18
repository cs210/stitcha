'use server';

import { redirect } from 'next/navigation';
import { KanbanBoard } from "@/components/kanban-board"
import { SearchHeader } from "@/components/search-header"


// TODO: Change this to be stitcha-assistant
export default async function RootPage() {
  if (window.location.pathname === '/kanban') {
    return (
      <div className="flex flex-col h-screen">
        <SearchHeader />
        <KanbanBoard />
      </div>
    );
  }
  
  redirect('/dashboard/settings');
}
