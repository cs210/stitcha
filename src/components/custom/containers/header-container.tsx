import { Separator } from '../../ui/separator';

// Container element for page header and description
export function HeaderContainer({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div>
			{children}
			<Separator className='mt-2' />
		</div>
	);
}
