import React from 'react';
import Link from '@components/ui/link';

interface MenuItem {
  id: number | string;
  slug: string;
  name: string;
  columnItemItems?: MenuItem[];
}
type MegaMenuProps = {
  columns: {
    id: number | string;
    slug: string,
    name: string,
    sub_category: MenuItem[];
  }[];
};
const MegaMenu: React.FC<MegaMenuProps> = ({ columns }) => {
  return (
    <div className="absolute bg-gray-200 megaMenu shadow-header ltr:-left-28 rtl:-right-28 ltr:xl:left-0 rtl:xl:right-0">
      <div className={`grid grid-cols-4`}>
        {columns?.map((column, key) => (
          <ul
            className="pt-6 even:bg-gray-150 pb-7 2xl:pb-8 2xl:pt-7"
            key={key}
          >
            <React.Fragment>
              <li className="mb-1.5">
                <Link
                  href={'/search?category=' + column.slug}
                  className="block text-sm py-1.5 text-heading font-semibold px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                >
                  {column.name}
                </Link>
              </li>
              {column?.sub_category?.map((item: any) => (
                <li
                  key={item.id}
                // className={
                //   column?.sub_category?.length === item.id
                //     ? 'border-b border-gray-300 pb-3.5 mb-3'
                //     : ''
                // }
                >
                  <Link
                    href={'/search?category=' + item.slug}
                    className="text-body text-sm block py-1.5 px-5 xl:px-8 2xl:px-10 hover:text-heading hover:bg-gray-300"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </React.Fragment>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default MegaMenu;
