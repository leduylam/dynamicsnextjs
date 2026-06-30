import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { prepareTableHTML } from "@utils/prepareHTML";
import { sanitizeHtml } from "@utils/sanitize-html";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function ProductDetailTab({ data }: any) {
  // ✅ FIX: Hydration - Initialize với giá trị từ props để đảm bảo server và client giống nhau
  const [processedContent, setProcessedContent] = useState<string | null>(null);
  const [features, setFeatures] = useState<any[]>([]);
  
  // ✅ FIX: Hydration - Chỉ process content sau khi mount
  useEffect(() => {
    if (data?.content) {
      const html = prepareTableHTML(data?.content);
      setProcessedContent(html);
    }
    if (data?.features) {
      try {
        const featured = JSON.parse(data.features);
        setFeatures([
          {
            id: 1,
            title: "Features",
            content: featured,
          },
        ]);
      } catch (error) {
        setFeatures([]);
      }
    }
  }, [data]);
  
  // ✅ FIX: Hydration - Memoize allContent để tránh tính toán lại không cần thiết
  const allContent = useMemo(() => 
    features.flatMap((feature: any) => feature.content || []),
    [features]
  );
  const half = Math.ceil(allContent.length / 2);
  const columns = useMemo(() => [
    allContent.slice(0, half), 
    allContent.slice(half)
  ], [allContent, half]);

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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(processedContent) }}
                suppressHydrationWarning
              />
            </TabPanel>
          )}
          {data?.includes && (
            <TabPanel key="includes">
              <p
                className="text-body text-sm lg:text-sm leading-6 lg:leading-8"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(data?.includes) }}
                suppressHydrationWarning
              ></p>
            </TabPanel>
          )}
          {features && features.length > 0 && allContent.length > 0 && (
            <TabPanel key="features">
              <motion.div
                key={JSON.stringify(allContent)} // Đổi key mỗi khi content thay đổi
                initial={false} // ✅ FIX: Hydration - Disable initial animation để match server
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
