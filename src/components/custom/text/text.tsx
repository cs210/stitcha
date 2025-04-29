export function P({ color, text, className }: { color?: string; text: string; className?: string }) {
	const colorClass = color === 'light-gray' ? 'text-gray-500' : color === 'dark-gray' ? 'text-gray-700' : '';

	return <p className={`leading-7 ${colorClass} ${className || ''}`}>{text}</p>;
}
