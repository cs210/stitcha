export function P({ color, text }: { color?: string; text: string }) {
	const colorClass = color === 'dark-gray' ? 'text-gray-500' : '';

	return <p className={`leading-7 ${colorClass}`}>{text}</p>;
}
