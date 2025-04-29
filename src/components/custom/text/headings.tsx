export function H1({ text, className }: { text: string; className?: string }) {
	return <h1 className={`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ${className || ''}`}>{text}</h1>;
}

export function H2({ text, className }: { text: string; className?: string }) {
	return <h2 className={`scroll-m-20 text-3xl font-semibold tracking-tight ${className || ''}`}>{text}</h2>;
}

export function H3({ text, className }: { text: string; className?: string }) {
	return <h3 className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className || ''}`}>{text}</h3>;
}

export function H4({ text, className }: { text: string; className?: string }) {
	return <h4 className={`scroll-m-20 text-xl font-semibold tracking-tight ${className || ''}`}>{text}</h4>;
}
