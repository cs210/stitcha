'use server';

import { redirect } from "next/navigation";

export default async function RootPage() {
	redirect('/sign-in');
}