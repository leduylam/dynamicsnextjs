import Layout from '@components/layout/layout';
import Container from '@components/ui/container';
import PageHeader from '@components/ui/page-header';
import { pumaShoeSizingChart } from '@settings/puma-shoe-sizing';
import { Link, Element } from 'react-scroll';

function makeTitleToDOMId(title: string) {
  return title.toLowerCase().split(' ').join('_');
}

export default function PumaShoeSizingChart() {
  return (
    <>
      <PageHeader pageHeader="Puma Shoe Sizing Chart" />
      <div className="px-4 mt-12 border-b border-gray-300 lg:mt-14 xl:mt-16 lg:py-1 xl:py-0 md:px-10 lg:px-7 xl:px-16 2xl:px-24 3xl:px-32 pb-9 md:pb-14 lg:pb-16 2xl:pb-20 3xl:pb-24">
        <Container>
          <div className="flex flex-col md:flex-row">
            <nav className="mb-8 md:w-72 xl:w-3/12 md:mb-0">
              <ol className="sticky z-10 md:top-16 lg:top-28">
                {pumaShoeSizingChart?.map((item, index) => (
                  <li key={item.id}>
                    <Link
                      spy={true}
                      offset={-120}
                      smooth={true}
                      duration={500}
                      to={makeTitleToDOMId(item.title)}
                      activeClass="text-heading font-semibold"
                      className="block cursor-pointer py-3 lg:py-3.5  text-sm lg:text-base  text-gray-700 uppercase"
                    >
                      {(index <= 9 ? '0' : '') +
                        index +
                        ' ' +
                        `${item.title}`}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            {/* End of section scroll spy menu */}

            <div className="pt-0 md:w-9/12 ltr:md:pl-8 rtl:md:pr-8 lg:pt-2">
              {pumaShoeSizingChart?.map((item) => (
                // @ts-ignore
                <Element
                  key={item.title}
                  id={makeTitleToDOMId(item.title)}
                  className="mb-10"
                >
                  <h2 className="mb-4 text-lg font-bold md:text-xl lg:text-2xl text-heading">
                    {`${item.title}`}
                  </h2>
                  <div
                    className="text-sm leading-7 text-heading lg:text-base lg:leading-loose"
                  >
                    {item.description.map((title, index) => (
                      <div key={index}>
                        <h2 className='text-lg md:text-xl lg:text-2xl text-heading font-bold text-center'>{title.appTitle}</h2>
                        {
                          title.table.map((table, tindex) => (
                            <div className='pb-12' key={tindex}>
                              <p className='bg-heading text-white text-lg md:text-xl text-center p-2 uppercase'>{table.head_title}</p>
                              <table className='w-full border border-heading'>
                                <thead>
                                  <tr>
                                    {table.thead.map((q: string) => (
                                      <th key={q} className='border border-heading'>{q}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.tbody.map((a, tbodyIndex) => (
                                    <tr key={tbodyIndex}>
                                      {a.tr.map((b, trIndex) => (
                                        <td className='text-center' key={trIndex}>{b}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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

PumaShoeSizingChart.Layout = Layout;

