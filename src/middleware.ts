import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)']);

export default clerkMiddleware(async (auth, request) => {
	try {
		if (!isPublicRoute(request)) {
			await auth.protect();
		}
	} catch (error) {
		console.error('Middleware error:', error);
		throw error; // Re-throw the error to maintain the original behavior
	}
});

export const config = {
	matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
