import { deleteAddress } from "@framework/checkout/get-all-address"
import { FaTrashAlt } from "react-icons/fa"
interface DeliveryAddressProps {
    items: any,
    handleOtherAddress: () => void
    handleChangeRadios: (id: number | null) => void
}
const CheckoutList = ({ items, handleOtherAddress, handleChangeRadios }: DeliveryAddressProps) => {
    const handleDeleteAddress = (id: number) => {
        deleteAddress(id)
    }
    return (
        <div className='shadow-product p-3'>
            {items.map((address: any) => (
                <div className='grid grid-cols-4 gap-2 border border-gray-300 p-2' key={address.id}>
                    <div className='flex items-center gap-2'>
                        <input
                            type="radio"
                            id={'delivery_address_' + address.id}
                            className='w-4 h-4'
                            value={address.id}
                            name="address_id"
                            onChange={() => handleChangeRadios(address.id)}
                        />
                        <label htmlFor={'delivery_address_' + address.id} className='text-sm'>
                            <span className='font-semibold block'>{address.name}</span>
                            <span className='block'>{address.mobile}</span>
                        </label>
                    </div>
                    <div className='text-sm col-span-2'>
                        {address.address}
                    </div>
                    <div className='text-sm'>
                        <p
                            onClick={() => handleDeleteAddress(address.id)}
                            className='float-right p-2 bg-red-500 hover:bg-red-300 hover:text-red-800 transition duration-150 text-white rounded-full cursor-pointer'>
                            <FaTrashAlt />
                        </p>
                    </div>
                </div>
            ))}
            <p
                onClick={handleOtherAddress}
                className='inline-block mt-2 px-3 py-1 md:text-sm font-semibold font-body rounded-md cursor-pointer  hover:underline transition ease-in-out duration-300'
            >
                Other Address ...
            </p>
        </div>
    )
}
export default CheckoutList