import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { prepareTableHTML } from "@utils/prepareHTML";
import { useEffect, useState } from "react";

export default function ProductDetailTab({ data }: any) {
    const [processedContent, setProcessedContent] = useState(data?.content)
    const [features, setFeatures] = useState<any[]>([])

    useEffect(() => {
        const featured = data?.features ? JSON.parse(data?.features) : []
        const html = prepareTableHTML(data?.content)
        setProcessedContent(html)
        setFeatures([
            {
                id: 1,
                title: 'Features',
                content: featured
            }
        ])
    }, [data])
    return (
        <div className="mb-12 md:mb-14 xl:mb-16">
            <TabGroup as="div">
                <TabList as="ul" className="tab-ul justify-center">
                    {processedContent && (
                        <Tab
                            key="description"
                            as='li'
                            className={({ selected }) =>
                                selected
                                    ? "tab-li-selected focus-visible:outline-0 focus-visible:outline-transparent"
                                    : "tab-li focus-visible:outline-0 focus-visible:outline-transparent"
                            }
                        >Description</Tab>
                    )}
                    {data?.includes && (
                        <Tab
                            key="includes"
                            as='li'
                            className={({ selected }) =>
                                selected
                                    ? "tab-li-selected focus-visible:outline-0 focus-visible:outline-transparent"
                                    : "tab-li focus-visible:outline-0 focus-visible:outline-transparent"
                            }
                        >{data.includes ? "Includes" : ""}</Tab>
                    )}
                    {data?.features && (
                        <Tab
                            key="features"
                            as='li'
                            className={({ selected }) =>
                                selected
                                    ? "tab-li-selected focus-visible:outline-0 focus-visible:outline-transparent"
                                    : "tab-li focus-visible:outline-0 focus-visible:outline-transparent"
                            }
                        >{data.features ? "Features" : ""}</Tab>
                    )}
                </TabList>
                <TabPanels className='md:px-20'>
                    {processedContent && (
                        <TabPanel key='description'>
                            <div
                                className="product-detail text-body text-sm leading-6"
                                dangerouslySetInnerHTML={{ __html: processedContent ?? "" }}
                            />
                        </TabPanel>
                    )}
                    {data?.includes && (
                        <TabPanel key="includes">
                            <p className="text-body text-sm lg:text-sm leading-6 lg:leading-8"
                                dangerouslySetInnerHTML={{ __html: data?.includes ?? "" }}
                            ></p>
                        </TabPanel>
                    )}
                    {features && (
                        <TabPanel key="features">
                            {features.map((item: any, index: number) => (
                                <ul className="" key={index}>
                                    {item.content.map((content: any) => (
                                        <li key={content.featuredValue}>{content.featuredValue}</li>
                                    ))}
                                </ul>
                            ))}
                        </TabPanel>
                    )}

                    {/* <TabPanel>
                        {features ? (
                            features.map((item: any) => (
                                <ul className="">
                                    {item.content.map((content: any) => (
                                        <li>{content.featuredValue}</li>
                                    ))}
                                </ul>
                            ))
                        ) : (
                            <p className="text-body text-sm lg:text-sm leading-6 lg:leading-8"
                                dangerouslySetInnerHTML={{ __html: data?.includes ?? "" }}
                            ></p>
                        )}

                    </TabPanel> */}

                </TabPanels>
            </TabGroup>
        </div>
    )
}