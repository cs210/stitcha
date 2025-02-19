// 'use client';

// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function RootPage() {
// 	const { user, isLoaded } = useUser();
// 	const router = useRouter();

// 	useEffect(() => {
// 		if (isLoaded) {
// 			if (user) {
// 				router.push('/kanban');
// 			} else {
// 				router.push('/sign-in');
// 			}
// 		}
// 	}, [isLoaded, user, router]);

// 	// Show loading state or nothing while checking auth
// 	return null;
// }

'use server';

import { redirect } from "next/navigation";

export default async function RootPage() {
	redirect('/sign-in');
}