// H1 Heading Component
export function H1({ children, className }: { children: React.ReactNode; className?: string }) {
	return <h1 className={`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ${className || ''}`}>{children}</h1>;
}

// H2 Heading Component
export function H2({ children, className }: { children: React.ReactNode; className?: string }) {
	return <h2 className={`scroll-m-20 text-3xl font-semibold tracking-tight ${className || ''}`}>{children}</h2>;
}

// H3 Heading Component
export function H3({ children, className }: { children: React.ReactNode; className?: string }) {
	return <h3 className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className || ''}`}>{children}</h3>;
}

// H4 Heading Component
export function H4({ children, className }: { children: React.ReactNode; className?: string }) {
	return <h4 className={`scroll-m-20 text-xl font-semibold tracking-tight ${className || ''}`}>{children}</h4>;
}
