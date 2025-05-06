export const ProductSkeleton = () => {
    return (
        <div className="p-4 border rounded animate-pulse">
            <div className="bg-gray-300 h-48 w-full rounded-md" />
            <div className="h-4 bg-gray-300 rounded mt-4 w-3/4 mx-auto" />
            <div className="h-4 bg-gray-300 rounded mt-2 w-1/2 mx-auto" />
        </div>
    );
};