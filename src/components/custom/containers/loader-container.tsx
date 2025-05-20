// Container element for the page loader element
export function LoaderContainer({ children }: { children: React.ReactNode }) {
	return <div className='flex justify-center items-center h-full'>{children}</div>;
}
