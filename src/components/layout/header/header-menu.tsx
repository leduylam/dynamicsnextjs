import Link from "@components/ui/link";
import { FaChevronDown } from "react-icons/fa";
import MegaMenu from "@components/ui/mega-menu";
import classNames from "classnames";
import ListMenu from "@components/ui/list-menu";

interface MenuProps {
  data: any;
  className?: string;
}

const HeaderMenu: React.FC<MenuProps> = ({ data, className }) => {
  const hasSubCategory = (categories: any[]): boolean => {
    return categories.some(
      (category) =>
        (Array.isArray(category.sub_category) &&
          category.sub_category.length > 0) ||
        (Array.isArray(category.subCategory) &&
          hasSubCategory(category.subCategory)) // Kiểm tra sâu hơn nếu có subCategory lồng nhau
    );
  };
  const isFullLink = (url: string): boolean => {
    return url.startsWith("http://") || url.startsWith("https://");
  };
  return (
    <nav className={classNames(`headerMenu flex w-full relative`, className)}>
      {data?.map((item: any) => {
        const showDropdown =
          Array.isArray(item.subCategory) && item.subCategory.length > 0;
        const href = isFullLink(item.slug)
          ? item.slug
          : `categories/${item.slug}`;
        return (
          <div
            className={`menuItem group cursor-pointer py-7 ${
              item.subMenu ? "relative" : ""
            }`}
            key={item.id}
          >
            <Link
              href={href}
              {...(isFullLink(href)
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="relative inline-flex items-center px-3 py-2 text-sm font-normal xl:text-base text-heading xl:px-4 group-hover:text-black"
            >
              {item.name}
              {item.subCategory && item.subCategory.length > 0 && (
                <span className="opacity-30 text-xs mt-1 xl:mt-0.5 w-4 flex justify-end">
                  <FaChevronDown className="transition duration-300 ease-in-out transform group-hover:-rotate-180" />
                </span>
              )}
            </Link>
            {showDropdown &&
              item?.subCategory &&
              Array.isArray(item.subCategory) &&
              (hasSubCategory(item.subCategory) ? (
                <MegaMenu columns={item.subCategory} />
              ) : (
                <div className="absolute invisible bg-gray-200 opacity-0 group-hover:visible subMenu shadow-header group-hover:opacity-100">
                  <ul className="py-5 text-sm text-body">
                    {item.subCategory.map((menu: any, index: number) => {
                      const dept: number = 1;
                      const menuName: string = `sidebar-menu-${dept}-${index}`;
                      return (
                        <ListMenu
                          dept={dept}
                          data={menu}
                          hasSubMenu={false}
                          menuName={menuName}
                          key={menuName}
                          menuIndex={index}
                        />
                      );
                    })}
                  </ul>
                </div>
              ))}
          </div>
        );
      })}
    </nav>
  );
};

export default HeaderMenu;
