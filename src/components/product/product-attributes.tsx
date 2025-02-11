
import cn from 'classnames';
interface Props {
  className?: string;
  title: string;
  attributes: {
    id: number;
    value: string;
    image: string;
    parent_id: number;
    quantity: number
  }[];
  active?: any;
  defuatlActive?: number;
  subActive?: number;
  activeAttributes?: any;
  handleAttributeParent: any;
  handleAttributeChildren: any;
}

export const ProductAttributes: React.FC<Props> = ({
  className = 'mb-4',
  title,
  attributes,
  defuatlActive,
  subActive,
  active,
  handleAttributeParent,
  handleAttributeChildren,
}) => {
  return (
    <div className={className}>
      <h3 className="text-base md:text-lg text-heading font-semibold mb-2.5 capitalize">
        {title} <span className='text-sm font-normal italic'>:{defuatlActive ? active : ''}</span>
      </h3>
      <ul className="flex flex-wrap colors ltr:-mr-3 rtl:-ml-3">
        {attributes?.map(({ id, value, image, parent_id, quantity }) => {
          return (
            <div key={id}>
              {
                parent_id === 0 && (
                  <li
                    key={`${value}-${id}`}
                    className={cn(
                      'cursor-pointer rounded border w-9 md:w-11 h-9 md:h-11 p-1 mb-2 md:mb-3 ltr:mr-2 rtl:ml-2 ltr:md:mr-3 rtl:md:ml-3 flex justify-center items-center text-heading text-xs md:text-sm uppercase font-semibold transition duration-200 ease-in-out hover:border-black',
                      id === defuatlActive ? 'border-black' : 'border-gray-100'
                    )}
                    onClick={() => handleAttributeParent({ [title]: value }, id)}
                  >
                    {image ? (
                      <span
                        className="block w-full h-full rounded"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${process.env.NEXT_PUBLIC_SITE_URL}/${image}`} alt="" />
                      </span>

                    ) :
                      (
                        <span
                          className="flex justify-center items-center w-full h-full rounded"
                        >
                          {value}
                        </span>
                      )
                    }
                  </li>
                )
              }
              {
                parent_id === defuatlActive && (
                  <div>
                    {quantity > 0 ? (
                      <li
                        key={`${value}-${id}`}
                        className={cn(
                          'cursor-pointer rounded border min-w-9 md:min-w-11 h-9 md:h-11 p-1 mb-2 md:mb-3 ltr:mr-2 rtl:ml-2 ltr:md:mr-3 rtl:md:ml-3 flex justify-center items-center text-heading text-xs md:text-sm font-semibold transition duration-200 ease-in-out hover:border-black',
                          id === subActive ? 'border-black' : 'border-gray-100'
                        )}
                        onClick={() => handleAttributeChildren({ [title]: value }, id)}
                      >
                        {value}
                      </li>
                    ) : (
                      <li
                        key={`${value}-${id}`}
                        className={cn(
                          'cursor-not-allowed rounded border bg-gray-400 w-9 md:min-w-11 h-9 md:h-11 p-1 mb-2 md:mb-3 ltr:mr-2 rtl:ml-2 ltr:md:mr-3 rtl:md:ml-3 flex justify-center items-center text-heading text-xs md:text-sm font-semibold transition duration-200 ease-in-out',
                        )}
                      >
                        {value}
                      </li>
                    )}

                  </div>
                )
              }
            </div>
          )
        })}
      </ul>
    </div>
  );
};
