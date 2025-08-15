import Layout from "@components/layout/layout";
import { usKidSizingChart } from "@settings/us-kid-sizing";
import { Element } from "react-scroll";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import Breadcrumb from "@components/common/breadcrumb";

export default function UsKidGolfSizingChart() {
  return (
    <>
      <div className="px-4 mt-12 border-b border-gray-300 lg:mt-14 xl:mt-16 lg:py-1 xl:py-0 md:px-10 lg:px-7 xl:px-16 2xl:px-24 3xl:px-32 pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24">
        <div className="pt-8">
          <Breadcrumb />
        </div>
        <div className="flex justify-center">
          <div className="pt-0 md:w-2/3 ltr:md:pl-8 rtl:md:pr-8 lg:pt-2">
            {usKidSizingChart?.map((item) => (
              // @ts-ignore
              <Element
                key={item.title}
                // id={makeTitleToDOMId(item.title)}
                className="mb-10"
              >
                <h2 className="mb-4 text-lg font-bold md:text-xl lg:text-2xl text-heading">
                  {`${item.title}`}
                </h2>
                <div className="text-sm leading-7 text-heading lg:text-base lg:leading-loose">
                  {item.description.map((title, index) => (
                    <div key={index}>
                      <h2 className="text-lg text-heading font-bold text-center">
                        {title.appTitle}
                      </h2>
                      {title.table.map((table, index) => (
                        <div className="pb-12" key={index}>
                          <table className="w-full">
                            <thead>
                              <tr className="bg-[#CCCCCC]">
                                {table.thead.map((q: string) => (
                                  <th
                                    key={q}
                                    className=" leading-5"
                                    dangerouslySetInnerHTML={{ __html: q }}
                                  />
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.tbody.map((a, index) => (
                                <tr key={index}>
                                  {a.tr.map((b, index) => (
                                    <td
                                      className={`${
                                        typeof b === "object" ? b.className : ""
                                      }`}
                                      align="center"
                                      key={index}
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          typeof b === "object" ? b.content : b,
                                      }}
                                    />
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Element>
            ))}
          </div>
          {/* End of content */}
        </div>
      </div>
    </>
  );
}

UsKidGolfSizingChart.Layout = Layout;
export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  try {
    return {
      props: {
        ...(await serverSideTranslations(locale!, [
          "common",
          "forms",
          "footer",
        ])),
      },
    };
  } catch (error) {
    return {
      props: {
        ...(await serverSideTranslations(locale!, [
          "common",
          "forms",
          "footer",
        ])),
      },
    };
  }
};
