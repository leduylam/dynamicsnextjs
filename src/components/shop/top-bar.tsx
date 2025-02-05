import { Drawer } from '@components/common/drawer/drawer';
import FilterIcon from '@components/icons/filter-icon';
import Text from '@components/ui/text';
import { useUI } from '@contexts/ui.context';
import FilterSidebar from '@components/shop/filter-sidebar';
import ListBox from '@components/ui/list-box';
import { useRouter } from 'next/router';
import { getDirection } from '@utils/get-direction';
import motionProps from '@components/common/drawer/motion';
import { isEmpty } from 'lodash';
export default function SearchTopBar() {
  const { openFilter, displayFilter, closeFilter } = useUI();
  const router = useRouter();
  const { locale, query } = router
  const dir = getDirection(locale);
  return (
    <div className="flex justify-between items-center mb-7">
      <div>
        {!isEmpty(query) &&
          Object.values(query)
            .join(",")
            .split(",")
            .map((v, idx) => (
              <Text
                variant="pageHeading"
                className="hidden lg:inline-flex pb-1 capitalize mx-1"
                key={idx}
              >
                {idx === 0 ? (
                  <span>
                    {v}
                  </span>
                ) : (
                  <span>
                    <span className='mr-1 font-normal text-gray-400'>|</span>
                    {v}
                  </span>
                )
                }

              </Text>
            ))}
      </div>

      {/* <FilteredItem
        itemKey={
          Object.keys(query).find((k) => query[k]?.includes(v))!
        }
        itemValue={v}
        key={idx}
      /> */}
      <button
        className="lg:hidden text-heading text-sm px-4 py-2 font-semibold border border-gray-300 rounded-md flex items-center transition duration-200 ease-in-out focus:outline-none hover:bg-gray-200"
        onClick={openFilter}
      >
        <FilterIcon />
        <span className="ltr:pl-2.5 rtl:pr-2.5">
          Filters
        </span>
      </button>
      <div className="flex items-center justify-end">
        {/* <div className="flex-shrink-0 text-body text-xs md:text-sm leading-4 ltr:pr-4 rtl:pl-4 ltr:md:mr-6 rtl:md:ml-6 ltr:pl-2 rtl:pr-2 hidden lg:block">
          9,608 {t('text-items')}
        </div> */}
        <ListBox
          options={[
            { name: 'Sorting Options', value: 'options' },
            { name: 'Newest', value: 'newest' },
            { name: 'Popularity', value: 'popularity' },
            { name: 'Price: low to high', value: 'low-high' },
            { name: 'Price: high to low', value: 'high-low' },
          ]}
        />
      </div>
      {/* TODO: need to use just one drawer component */}
      <Drawer placement={dir === 'rtl' ? 'right' : 'left'} open={displayFilter} onClose={closeFilter} {...motionProps}>
        <FilterSidebar />
      </Drawer>
    </div>
  );
}
