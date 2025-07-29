import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { prepareTableHTML } from "@utils/prepareHTML";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ProductDetailTab({ data }: any) {
  const [processedContent, setProcessedContent] = useState(data?.content);
  const [features, setFeatures] = useState<any[]>([]);
  const allContent = features.flatMap((feature: any) => feature.content);
  useEffect(() => {
    const featured = data?.features ? JSON.parse(data?.features) : [];
    const html = prepareTableHTML(data?.content);
    setProcessedContent(html);
    setFeatures([
      {
        id: 1,
        title: "Features",
        content: featured,
      },
    ]);
  }, [data]);
  const half = Math.ceil(allContent.length / 2);
  const columns = [allContent.slice(0, half), allContent.slice(half)];
  const isEmpty = (value: any) => {
    const str = typeof value === "string" ? value.trim().toLowerCase() : "";
    return (
      value === null ||
      value === undefined ||
      str === "null" ||
      str === "" ||
      str === "undefined" ||
      str === "0" ||
      str === "[]" ||
      str === "{}"
    );
  };

  const hasContent = !isEmpty(data?.content);
  const hasIncludes = !isEmpty(data?.includes);
  let parsedFeatures: any[] = [];

  try {
    parsedFeatures = data?.features ? JSON.parse(data.features) : [];
  } catch (err) {
    parsedFeatures = [];
  }
  const hasFeatures =
    Array.isArray(parsedFeatures) && parsedFeatures.length > 0;

  if (!hasContent || !hasIncludes || !hasFeatures) return null;
  return (
    <div className="mb-12 md:mb-14 xl:mb-16">
      <TabGroup as="div">
        <TabList as="ul" className="tab-ul justify-center">
          {processedContent && (
            <Tab
              key="description"
              as="li"
              className={({ selected }) =>
                selected
                  ? "tab-li-selected focus-visible:outline-0 focus-visible:outline-transparent"
                  : "tab-li focus-visible:outline-0 focus-visible:outline-transparent"
              }
            >
              Description
            </Tab>
          )}
          {data?.includes && (
            <Tab
              key="includes"
              as="li"
              className={({ selected }) =>
                selected
                  ? "tab-li-selected focus-visible:outline-0 focus-visible:outline-transparent"
                  : "tab-li focus-visible:outline-0 focus-visible:outline-transparent"
              }
            >
              {data.includes ? "Includes" : ""}
            </Tab>
          )}
          {data?.features && (
            <Tab
              key="features"
              as="li"
              className={({ selected }) =>
                selected
                  ? "tab-li-selected focus-visible:outline-0 focus-visible:outline-transparent"
                  : "tab-li focus-visible:outline-0 focus-visible:outline-transparent"
              }
            >
              {data.features ? "Features" : ""}
            </Tab>
          )}
        </TabList>
        <TabPanels className="md:px-20">
          {processedContent && (
            <TabPanel key="description">
              <div
                className="product-detail text-body text-sm leading-6"
                dangerouslySetInnerHTML={{ __html: processedContent ?? "" }}
              />
            </TabPanel>
          )}
          {data?.includes && (
            <TabPanel key="includes">
              <p
                className="text-body text-sm lg:text-sm leading-6 lg:leading-8"
                dangerouslySetInnerHTML={{ __html: data?.includes ?? "" }}
              ></p>
            </TabPanel>
          )}
          {features && (
            <TabPanel key="features">
              <motion.div
                key={JSON.stringify(allContent)} // Đổi key mỗi khi content thay đổi
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {columns.map((column, colIndex) => (
                    <ul key={colIndex} className="list-disc">
                      {column.map((content: string, index: number) => (
                        <li key={index}>{content}</li>
                      ))}
                    </ul>
                  ))}
                </div>
              </motion.div>
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
  );
}
