// The Classdesk mark (a speech bubble on a desk) and wordmark. public/favicon.svg is the same mark.
type LogoProps = {
    // Height of the mark in pixels; the wordmark scales with it.
    size?: number;
    className?: string;
};

function Logo({ size = 32, className = "" }: LogoProps) {
    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="7" className="fill-indigo-600" />
                <path
                    d="M10 6.5h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-7l-4 3.5v-3.5h-1a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z"
                    fill="#fff"
                />
                <rect x="11" y="10.5" width="10" height="2" rx="1" className="fill-indigo-600" />
                <rect x="11" y="14" width="6" height="2" rx="1" className="fill-indigo-600" />
                <rect x="5" y="24" width="22" height="2.5" rx="1.25" fill="#fff" />
            </svg>
            <span
                className="font-bold tracking-tight text-gray-800"
                style={{ fontSize: size * 0.75 }}
            >
                Class<span className="text-indigo-600">desk</span>
            </span>
        </span>
    );
}

export default Logo;
