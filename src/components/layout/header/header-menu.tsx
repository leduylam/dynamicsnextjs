import React, { useMemo, useState } from "react";
import Link from "@components/ui/link";
import { FaChevronDown } from "react-icons/fa";
import MegaMenu from "@components/ui/mega-menu";
import classNames from "classnames";
import ListMenu from "@components/ui/list-menu";
import { motion, AnimatePresence } from "framer-motion";

interface MenuProps {
  data: any;
  className?: string;
  firstMenuRef?: React.MutableRefObject<HTMLDivElement | null>;
}

type CategoryNode = {
  id: number | string;
  slug: string;
  name: string;
  subCategory?: CategoryNode[];
  sub_category?: CategoryNode[];
};

const isFullLink = (url: string): boolean =>
  url.startsWith("http://") || url.startsWith("https://");

const getChildren = (category: CategoryNode): CategoryNode[] => {
  if (Array.isArray(category?.subCategory) && category.subCategory.length) {
    return category.subCategory;
  }
  if (Array.isArray(category?.sub_category) && category.sub_category.length) {
    return category.sub_category;
  }
  return [];
};

const getCategoryDepth = (category: CategoryNode): number => {
  const children = getChildren(category);
  if (!children.length) return 1;
  return 1 + Math.max(...children.map(getCategoryDepth));
};

const HeaderMenuItem: React.FC<{
  item: CategoryNode;
  firstMenuRef?: React.MutableRefObject<HTMLDivElement | null>;
  onHoverChange?: (id: string | number | null) => void;
  isActive?: boolean;
}> = ({ item, onHoverChange, isActive }) => {
  const children = useMemo(() => getChildren(item), [item]);
  const hasChildren = children.length > 0;
  const depth = useMemo(() => getCategoryDepth(item), [item]);
  const shouldRenderMegaMenu = depth > 2;

  // Debug log
  if (shouldRenderMegaMenu) {
    console.log(`${item.name}: depth=${depth}, children count=${children.length}`, children);
  }

  const href = isFullLink(item.slug)
    ? item.slug
    : `/categories/${item.slug}`;

  return (<>
    <div
      className="menuItem group cursor-pointer py-7 relative"
      key={item.id}
      onMouseEnter={() => shouldRenderMegaMenu && onHoverChange?.(item.id)}
      onMouseLeave={() => shouldRenderMegaMenu && onHoverChange?.(null)}
    >
      <Link
        href={href}
        {...(isFullLink(href)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="relative inline-flex items-center px-3 py-2 text-sm font-normal xl:text-base text-heading xl:px-4 group-hover:text-black"
      >
        {item.name}
        {hasChildren && (
          <span className="opacity-30 text-xs mt-1 xl:mt-0.5 w-4 flex justify-end">
            <FaChevronDown className="transition duration-300 ease-in-out transform group-hover:-rotate-180" />
          </span>
        )}
      </Link>

      {hasChildren && !shouldRenderMegaMenu && (
        <div className="absolute invisible bg-gray-200 opacity-0 group-hover:visible subMenu shadow-header group-hover:opacity-100">
          <ul className="py-5 text-sm text-body">
            {children.map((menu: CategoryNode, index: number) => {
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
      )}
    </div>
    {
      hasChildren && shouldRenderMegaMenu && (
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 bg-white shadow-lg"
              onMouseEnter={() => onHoverChange?.(item.id)}
              onMouseLeave={() => onHoverChange?.(null)}
            >
              <MegaMenu columns={children} />
            </motion.div>
          )}
        </AnimatePresence>
      )
    }
  </>
  );
};

const HeaderMenu: React.FC<MenuProps> = ({ data, className, firstMenuRef }) => {
  const [activeItemId, setActiveItemId] = useState<string | number | null>(null);

  return (
    <nav className={classNames(`headerMenu flex w-full relative`, className)}>
      {data?.map((item: CategoryNode) => (
        <HeaderMenuItem 
          key={item.id} 
          item={item} 
          firstMenuRef={firstMenuRef}
          onHoverChange={setActiveItemId}
          isActive={activeItemId === item.id}
        />
      ))}
    </nav>
  );
};

export default HeaderMenu;
