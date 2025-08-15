import Breadcrumb from "@components/common/breadcrumb";
import Layout from "@components/layout/layout";
import { gregNormanSizingChart } from "@settings/greg-norman-sizing";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Element } from "react-scroll";

function makeTitleToDOMId(title: string) {
  return title.toLowerCase().split(" ").join("_");
}

export default function GregNomanApparelSizingChart() {
  return (
    <>
      <div className="mt-12 lg:mt-14 xl:mt-16 lg:py-1 xl:py-0 border-b border-gray-300 px-4 md:px-10 lg:px-7 xl:px-16 2xl:px-24 3xl:px-32 pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24">
        <div className="pt-8">
          <Breadcrumb />
        </div>
        <div className="flex flex-col">
          <div className="ltr:md:pl-8 rtl:md:pr-8 ">
            {gregNormanSizingChart?.map((item) => (
              // @ts-ignore
              <Element
                key={item.title}
                id={makeTitleToDOMId(item.title)}
                className="mb-10"
              >
                {item.img && (
                  <div className="mb-4">
                    <img src={item.img} alt={item.title} className="mx-auto" />
                  </div>
                )}
                {item.title && (
                  <h2 className="text-lg md:text-xl lg:text-2xl text-heading text-center font-bold mb-4">
                    {item.title}
                  </h2>
                )}
                <div className="text-heading text-sm leading-7 lg:text-base lg:leading-loose">
                  {item.description.map((title, index) => (
                    <div key={index}>
                      <h2 className="text-lg md:text-xl lg:text-2xl text-heading font-bold text-center">
                        {title.appTitle}
                      </h2>
                      {title.table.map((table, index) => (
                        <div className="pb-12" key={index}>
                          <p className="bg-heading text-white text-center p-2 uppercase">
                            {table.head_title}
                          </p>
                          <div className=" overflow-auto">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  {table.thead.map((q: string) => (
                                    <th
                                      key={q}
                                      className="p-2 bg-gray-100 text-center"
                                    >
                                      {q}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.tbody.map((a, index) => (
                                  <tr
                                    key={index}
                                    className="text-center odd:bg-white even:bg-gray-100 hover:bg-gray-200"
                                  >
                                    {a.tr.map((b, index) => (
                                      <td key={index} className="p-2">
                                        {b}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
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

GregNomanApparelSizingChart.Layout = Layout;
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
