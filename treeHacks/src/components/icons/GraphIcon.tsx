export function GraphIcon({ className }: { className?: string }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M2.5 13.5V2.5M2.5 13.5H13.5"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
			/>
			<path
				d="M4 10.5L6.5 8L8.5 9.5L12 6"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle cx="6.5" cy="8" r="0.9" fill="currentColor" />
			<circle cx="8.5" cy="9.5" r="0.9" fill="currentColor" />
		</svg>
	)
}
