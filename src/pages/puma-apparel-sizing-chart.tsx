import Layout from '@components/layout/layout';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/page-header';
import { pumaApparelSizingChart } from '@settings/puma-app-sizing';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Link, Element } from 'react-scroll';

function makeTitleToDOMId(title: string) {
  return title.toLowerCase().split(' ').join('_');
}

export default function PumaApparelSizingChart() {
  return (
    <>
      <PageHeader pageHeader="Puma Apparel Sizing Chart" />
      <div className="mt-12 lg:mt-14 xl:mt-16 lg:py-1 xl:py-0 border-b border-gray-300 px-4 md:px-10 lg:px-7 xl:px-16 2xl:px-24 3xl:px-32 pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24">
        <Container>
          <div className="flex flex-col md:flex-row">
            <nav className="md:w-72 xl:w-2/12 mb-8 md:mb-0">
              <ol className="sticky md:top-16 lg:top-28 z-10">
                {pumaApparelSizingChart?.map((item, index) => (
                  <li key={item.id}>
                    <Link
                      spy={true}
                      offset={-120}
                      smooth={true}
                      duration={500}
                      to={makeTitleToDOMId(item.title)}
                      activeClass="text-heading font-semibold"
                      className="block cursor-pointer py-3 lg:py-3.5 text-sm lg:text-base  text-gray-700 uppercase"
                    >
                      {(index <= 9 ? '0' : '') +
                        index +
                        ' ' +
                        item.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            {/* End of section scroll spy menu */}

            <div className="md:w-10/12 ltr:md:pl-8 rtl:md:pr-8 ">
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
                  <div
                    className="text-heading text-sm leading-7 lg:text-base lg:leading-loose"
                  >
                    {item.description.map((title, index) => (
                      <div key={index}>
                        <h2 className='text-lg md:text-xl lg:text-2xl text-heading font-bold text-center'>{title.appTitle}</h2>
                        {
                          title.table.map((table, index) => (
                            <div className='pb-12' key={index}>
                              <p className='bg-heading text-white text-lg md:text-xl text-center p-2 uppercase'>{table.head_title}</p>
                              <div className=' overflow-auto'>
                                <table className='w-full border border-heading'>
                                  <thead>
                                    <tr>
                                      {table.thead.map((q: string) => (
                                        <th key={q} className='border border-heading'>{q}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {table.tbody.map((a, index) => (
                                      <tr key={index}>
                                        {a.tr.map((b, index) => (
                                          <td key={index}>{b}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                            </div>
                          ))
                        }
                      </div>
                    ))}
                  </div>
                </Element>
              ))}
            </div>
            {/* End of content */}
          </div>
        </Container>
      </div>
    </>
  );
}

PumaApparelSizingChart.Layout = Layout;
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