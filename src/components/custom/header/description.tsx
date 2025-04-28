export function Description({ text }: { text: string }) {
	return <p className='leading-7 [&:not(:first-child)]:mt-2'>{text}</p>;
}
