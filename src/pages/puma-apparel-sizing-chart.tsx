import Breadcrumb from "@components/common/breadcrumb";
import Layout from "@components/layout/layout";
import Container from "@components/ui/container";
import { pumaApparelSizingChart } from "@settings/puma-app-sizing";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Element } from "react-scroll";

function makeTitleToDOMId(title: string) {
  return title.toLowerCase().split(" ").join("_");
}

export default function PumaApparelSizingChart() {
  return (
    <>
      <Container>
        <div className="pt-8">
          <Breadcrumb />
        </div>
        <div className="px-4 mt-12 border-b border-gray-300">
          <div className="flex flex-col">
            <div className="ltr:md:pl-8 rtl:md:pr-8 ">
              {pumaApparelSizingChart?.map((item) => (
                // @ts-ignore
                <Element
                  key={item.title}
                  id={makeTitleToDOMId(item.title)}
                  className="mb-10"
                >
                  <h2 className="text-lg md:text-xl lg:text-2xl text-heading font-bold mb-4">
                    {item.title}
                  </h2>
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
                                      className="odd:bg-white even:bg-gray-100 hover:bg-gray-200"
                                    >
                                      {a.tr.map((b, index) => (
                                        <td
                                          key={index}
                                          className="p-2 text-center"
                                        >
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
      </Container>
    </>
  );
}

PumaApparelSizingChart.Layout = Layout;
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
