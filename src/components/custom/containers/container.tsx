// Container element to surround dashboard elements
export function Container({ children }: { children: React.ReactNode }) {
	return <div className='py-4'>{children}</div>;
}
