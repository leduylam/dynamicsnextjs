import Layout from "@components/layout/layout";
import RetailerTable from "@components/retailer-locator/retailer-table";
import Container from "@components/ui/container";
import ListBox from "@components/ui/list-box";
import PageHeader from "@components/ui/page-header";
import { getProvinces, useRetailerQuery } from "@framework/retailer-locator/get-all-retailer";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
    try {
        return {
            props: {
                ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
            },
        };
    } catch (error) {
        return {
            props: {
                ...(await serverSideTranslations(locale!, ["common", "forms", "footer"])),
            },
        };
    }
};
export default function ShopsPage() {
    const { query } = useRouter();
    const [options, setOptions] = useState([
        { name: "Provinces", value: "options" }
    ])
    const {
        isFetching: isLoading,
        fetchNextPage,
        isFetchingNextPage: loadingMore,
        hasNextPage,
        data
    } = useRetailerQuery({ limit: 20, ...query })
    const totalCount = data?.pages?.reduce((acc, page) => acc + page.data.length, 0) || 0;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getProvinces(); // Chờ API trả về
                const provinceData = response.data
                const provinceOptions = provinceData.provinces.map((province: any) => ({
                    name: province?.provinces?.name,
                    value: province?.provinces?.name_en,
                }));
                setOptions(provinceOptions);
            } catch (error) {
                console.log(error);
            }
        };
        fetchData()
    }, [query])
    return (
        <>
            <PageHeader pageHeader="Retailer locator" />
            <div className="mt-12 lg:mt-14 xl:mt-16 lg:py-1 xl:py-0 border-b border-gray-300 px-4 md:px-10 lg:px-7 xl:px-16 2xl:px-24 3xl:px-32 pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24">
                <Container>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-shrink-0 text-body text-xs md:text-sm leading-4 ltr:pr-4 rtl:pl-4 ltr:md:mr-6 rtl:md:ml-6 ltr:pl-2 rtl:pr-2 hidden lg:block">
                            {totalCount} items
                        </div>
                        <ListBox
                            options={options}
                        />
                    </div>
                    <RetailerTable
                        isLoading={isLoading}
                        fetchNextPage={fetchNextPage}
                        loadingMore={loadingMore}
                        hasNextPage={hasNextPage}
                        data={data}
                    />
                    {/* <Subscription /> */}
                </Container>
            </div>
        </>
    );
}

ShopsPage.Layout = Layout;