import { useState } from 'react';
import Link from '@components/ui/link';
import Scrollbar from '@components/common/scrollbar';
import { IoIosArrowDown } from 'react-icons/io';
import Logo from '@components/ui/logo';
import { useUI } from '@contexts/ui.context';
import {
  IoLogoInstagram,
  IoLogoTwitter,
  IoLogoFacebook,
  IoLogoYoutube,
  IoClose,
} from 'react-icons/io5';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { getCategory } from '@framework/category/get-category-server';
import { useQuery } from '@tanstack/react-query';
const social = [
  {
    id: 0,
    link: '',
    icon: <IoLogoFacebook />,
    className: 'facebook',
    title: 'text-facebook',
  },
  {
    id: 1,
    link: '',
    icon: <IoLogoTwitter />,
    className: 'twitter',
    title: 'text-twitter',
  },
  {
    id: 2,
    link: '',
    icon: <IoLogoYoutube />,
    className: 'youtube',
    title: 'text-youtube',
  },
  {
    id: 3,
    link: '',
    icon: <IoLogoInstagram />,
    className: 'instagram',
    title: 'text-instagram',
  },
];

const MobileMenu = () => {
  const [activeMenus, setActiveMenus] = useState<any>([]);
  const { data: category } = useQuery({
    queryKey: [API_ENDPOINTS.CATEGORIES_SERVER],
    queryFn: getCategory,
    staleTime: 1000 * 60 * 10,
  });

  const { closeSidebar } = useUI();
  const handleArrowClick = (menuName: string) => {
    let newActiveMenus = [...activeMenus];
    if (newActiveMenus.includes(menuName)) {
      var index = newActiveMenus.indexOf(menuName);
      if (index > -1) {
        newActiveMenus.splice(index, 1);
      }
    } else {
      newActiveMenus.push(menuName);
    }
    setActiveMenus(newActiveMenus);
  };

  const ListMenu = ({
    dept,
    data,
    hasSubMenu,
    menuName,
    menuIndex,
    className = '',
  }: any) =>
    data && (
      <li className={`mb-0.5 ${className}`}>
        <div className="relative flex items-center justify-between">
          <Link
            href={'/search?category=' + data.slug}
            className="w-full text-[15px] menu-item relative py-3 ltr:pl-5 rtl:pr-5 ltr:md:pl-6 rtl:md:pr-6 ltr:pr-4 rtl:pl-4 transition duration-300 ease-in-out"
          >
            <span className="block w-full" onClick={closeSidebar}>
              {`${data.name}`}
            </span>
          </Link>
          {hasSubMenu && (
            <div
              className="absolute top-0 flex items-center justify-end w-full h-full text-lg cursor-pointer ltr:left-0 rtl:right-0 ltr:pr-5 rtl:pl-5"
              onClick={() => handleArrowClick(menuName)}
            >
              <IoIosArrowDown
                className={`transition duration-200 ease-in-out transform text-heading ${activeMenus.includes(menuName) ? '-rotate-180' : 'rotate-0'
                  }`}
              />
            </div>
          )}
        </div>
        {hasSubMenu && (
          <SubMenu
            dept={dept}
            data={data.subCategory || data.sub_category}
            toggle={activeMenus.includes(menuName)}
            menuIndex={menuIndex}
          />
        )}
      </li>
    );

  const SubMenu = ({ dept, data, toggle, menuIndex }: any) => {
    if (!toggle) {
      return null;
    }



    dept = dept + 1;
    return (
      <ul className="pt-0.5">
        {data?.map((menu: any, index: number) => {
          const menuName: string = `sidebar-submenu-${dept}-${menuIndex}-${index}`;

          return (
            <ListMenu
              dept={dept}
              data={menu}
              hasSubMenu={menu.sub_category.length > 0}
              menuName={menuName}
              key={menuName}
              menuIndex={index}
              className={dept > 1 && 'ltr:pl-4 rtl:pr-4'}
            />
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <div className="flex flex-col justify-between w-full h-full">
        <div className="w-full border-b border-gray-100 flex justify-between items-center relative ltr:pl-5 rtl:pr-5 ltr:md:pl-7 rtl:md:pr-7 flex-shrink-0 py-0.5">
          <Logo />
          <button
            className="flex items-center justify-center px-4 py-6 text-2xl text-gray-500 transition-opacity md:px-6 lg:py-8 focus:outline-none hover:opacity-60"
            onClick={closeSidebar}
            aria-label="close"
          >
            <IoClose className="text-black mt-1 md:mt-0.5" />
          </button>
        </div>

        <Scrollbar className="flex-grow mb-auto menu-scrollbar">
          <div className="flex flex-col px-0 py-7 lg:px-2 text-heading">
            <ul className="mobileMenu">
              {category.categories.map((menu: any, index: number) => {
                const dept: number = 1;
                const menuName: string = `sidebar-menu-${dept}-${index}`;
                return (
                  <ListMenu
                    dept={dept}
                    data={menu}
                    hasSubMenu={menu.subCategory}
                    menuName={menuName}
                    key={menuName}
                    menuIndex={index}
                  />
                );
              })}
            </ul>
          </div>
        </Scrollbar>

        <div className="flex items-center justify-center flex-shrink-0 bg-white border-t border-gray-100 px-7 gap-x-1">
          {social?.map((item, index) => (
            <a
              href={item.link}
              className={`text-heading p-5 opacity-60 ltr:first:-ml-4 rtl:first:-mr-4 transition duration-300 ease-in hover:opacity-100 ${item.className}`}
              target="_blank"
              key={index}
            >
              <span className="sr-only">{`${item.title}`}</span>
              {item.icon}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
export default MobileMenu;