import { Separator } from '../ui/separator';

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
