'use server';

import { redirect } from 'next/navigation';

// TODO: Change this to be stitcha-assistant
export default async function RootPage() {
	redirect(`/kanban`);
}

