// Text Component
export function P({ color, children, className }: { color?: string; children: React.ReactNode; className?: string }) {
	const colorClass = color === 'light-gray' ? 'text-gray-500' : color === 'dark-gray' ? 'text-gray-700' : '';

	return <p className={`leading-7 ${colorClass} ${className || ''}`}>{children}</p>;
}
