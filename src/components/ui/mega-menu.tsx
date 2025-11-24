import React from "react";
import Link from "@components/ui/link";
import { motion } from "framer-motion";

type CategoryNode = {
  id: number | string;
  slug: string;
  name: string;
  subCategory?: CategoryNode[];
  sub_category?: CategoryNode[];
};

type MegaMenuProps = {
  columns?: CategoryNode[];
};

const MegaMenu: React.FC<MegaMenuProps> = ({ columns }) => {
  const normalizedColumns = Array.isArray(columns) ? columns : [];

  const getChildren = (category: CategoryNode): CategoryNode[] => {
    if (Array.isArray(category.subCategory) && category.subCategory.length) {
      return category.subCategory;
    }
    if (Array.isArray(category.sub_category) && category.sub_category.length) {
      return category.sub_category;
    }
    return [];
  };

  const renderNestedItems = (category: CategoryNode, depth = 0) => {
    const children = getChildren(category);
    const isColumnHeader = depth === 0;

    const childContent = children.length ? (
      <ul className="mt-1 space-y-1">
        {children.map((child) => renderNestedItems(child, depth + 1))}
      </ul>
    ) : null;

    return (
      <li key={`${category.id ?? category.slug}-${depth}`}>
        <Link
          href={`/categories/${category.slug}`}
          className={[
            "block py-1.5 transition-colors duration-150 hover:bg-gray-300",
            isColumnHeader
              ? "text-sm font-semibold text-gray-900 hover:text-black px-3 xl:px-5 2xl:px-6"
              : "text-sm text-gray-700 hover:text-gray-900 px-4 xl:px-6 2xl:px-7",
          ].join(" ")}
        >
          {category.name}
        </Link>
        {childContent}
      </li>
    );
  };

  const columnCount = normalizedColumns.length || 1;
  const gridTemplateColumns = `repeat(${Math.min(
    columnCount,
    4
  )}, minmax(0, 1fr))`;

  if (!normalizedColumns.length) {
    return (
      <div className="megaMenu !opacity-100 shadow-header p-6">
        <p className="text-sm text-body">No categories available</p>
      </div>
    );
  }

  return (
    <div className="megaMenu !opacity-100 shadow-header min-h-[200px] z-[9999]">
      <div className="px-4 py-6">
        <div className="grid gap-x-6" style={{ gridTemplateColumns }}>
          {normalizedColumns.map((column, index) => (
            <motion.ul
              key={column.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="pt-2 pb-4 2xl:pb-6 2xl:pt-4 even:bg-gray-150 space-y-1"
            >
              {renderNestedItems(column)}
            </motion.ul>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
