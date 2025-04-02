
import { useWindowSize } from '@utils/use-window-size';
import { useSsrCompatible } from '@utils/use-ssr-compatible';
import Button from '@components/ui/button';

interface RetailerProps {
    isLoading: boolean
    fetchNextPage: () => void
    loadingMore: boolean
    hasNextPage: boolean
    data: any
}
const RetailerTable: React.FC<RetailerProps> = ({ isLoading, fetchNextPage, loadingMore, hasNextPage, data }) => {
    const { width } = useSsrCompatible(useWindowSize(), { width: 0, height: 0 });
    return (
        <>
            {width >= 990 ? (
                <div>
                    <div className="text-sm lg:text-base grid grid-cols-3">
                        <div className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right ltr:first:rounded-tl-md rtl:first:rounded-tr-md">
                            Store
                        </div>
                        <div className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right lg:text-center">
                            Phone
                        </div>
                        <div className="p-4 font-semibold bg-gray-100 text-heading ltr:text-left rtl:text-right lg:text-center">
                            Address
                        </div>
                    </div>
                    <div className="text-sm lg:text-base">
                        {isLoading && data?.pages.length ? (
                            <div className='text-center p-4'>Loadding...</div>
                        ) : (
                            data?.pages.flatMap((page: any) => {
                                return page.data.map((store: any) => (
                                    <ul className="grid grid-cols-4 gap-1 px-4 pt-5 pb-6 text-sm font-semibold border border-gray-300 rounded-md text-heading"
                                        key={store.id}
                                    >
                                        <li className='border-r border-gray-400'>
                                            <span className="font-bold">{store.name}</span>
                                        </li>
                                        <li className='border-r border-gray-400 pl-2'>
                                            <span className="font-normal">{store.phone}</span>
                                        </li>
                                        <li className='col-span-2 pl-2'>
                                            <span className="font-normal">{store.address}</span>
                                        </li>
                                    </ul>
                                ))
                            })
                        )}
                    </div>
                    <div className="text-center pt-8 xl:pt-14">
                        {hasNextPage && (
                            <Button
                                loading={loadingMore}
                                disabled={loadingMore}
                                onClick={() => fetchNextPage()}
                                variant="slim"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                            >
                                Load More
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="w-full space-y-4">
                        {isLoading && data?.pages.length ? (
                            <div>Loading...</div>
                        ) : (
                            data?.pages.flatMap((page: any) => {
                                return page.data.map((store: any) => (
                                    <ul className="flex flex-col px-4 pt-5 pb-6 space-y-5 text-sm font-semibold border border-gray-300 rounded-md text-heading"
                                        key={store.id}
                                    >
                                        <li className="flex items-center justify-between gap-2">
                                            Store:
                                            <span className="font-normal">
                                                {store.name}
                                            </span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            Phone
                                            <span className="font-normal">{store.phone}</span>
                                        </li>
                                        <li className="flex items-center justify-between gap-2">
                                            Address:
                                            <span className="font-normal">{store.address}</span>
                                        </li>
                                    </ul>
                                ))
                            })
                        )}
                    </div>
                    <div className="text-center pt-8 xl:pt-14">
                        {hasNextPage && (
                            <Button
                                loading={loadingMore}
                                disabled={loadingMore}
                                onClick={() => fetchNextPage()}
                                variant="slim"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                            >
                                Load More
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default RetailerTable;

