export default function SkeletonLoader() {
    return (
        <div className="space-y-4 p-6">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`max-w-[60%] rounded-3xl p-4 ${i % 2 === 0 ? 'rounded-tr-md' : 'rounded-tl-md'
                        } skeleton`}>
                        <div className="h-4 w-48 rounded skeleton mb-2"></div>
                        <div className="h-4 w-32 rounded skeleton"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
