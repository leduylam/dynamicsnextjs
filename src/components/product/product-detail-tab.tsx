import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { prepareTableHTML } from "@utils/prepareHTML";
import { useEffect, useState } from "react";

export default function ProductDetailTab({ data }: any) {
    const [processedContent, setProcessedContent] = useState(data?.content)

    useEffect(() => {
        // Chỉ chạy ở client vì DOMParser không chạy trên server
        const html = prepareTableHTML(data?.content)
        setProcessedContent(html)
    }, [data])

    return (
        <div className="mb-12 md:mb-14 xl:mb-16">
            <TabGroup as="div">
                <TabList as="ul" className="tab-ul justify-center">
                    <Tab
                        as='li'
                        className={({ selected }) =>
                            selected
                                ? "tab-li-selected focus-visible:outline-0 focus-visible:outline-transparent"
                                : "tab-li focus-visible:outline-0 focus-visible:outline-transparent"
                        }
                    >Description</Tab>
                    {data.features || data.includes && (
                        <Tab
                            as='li'
                            className={({ selected }) =>
                                selected
                                    ? "tab-li-selected focus-visible:outline-0 focus-visible:outline-transparent"
                                    : "tab-li focus-visible:outline-0 focus-visible:outline-transparent"
                            }
                        >{data.features ? "Features" : data.includes ? "Includes" : ""}</Tab>
                    )}

                </TabList>
                <TabPanels className='md:px-20'>
                    <TabPanel>
                        <div
                            className="product-detail text-body text-sm leading-6"
                            dangerouslySetInnerHTML={{ __html: processedContent ?? "" }}
                        />
                    </TabPanel>
                    <TabPanel>
                        <p className="text-body text-sm lg:text-sm leading-6 lg:leading-8"
                            dangerouslySetInnerHTML={{ __html: data?.includes ?? "" }}
                        ></p>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    )
}