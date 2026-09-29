import { Address } from "@framework/checkout/get-all-address";
interface DeliveryAddressProps {
  items: Address[];
  handleOtherAddress: () => void;
  handleChangeRadios: (id: number | null) => void;
  addressId: number | null;
}
const CheckoutList = ({
  items,
  handleOtherAddress,
  handleChangeRadios,
  addressId,
}: DeliveryAddressProps) => {
  return (
    <div className="shadow-product p-3">
      {items.map((address) => {
        const fullName =
          address.name ||
          `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim();
        const line = [
          address.address_line_1,
          address.address_line_2,
          address.city,
          address.state_province,
          address.country,
        ]
          .filter(Boolean)
          .join(", ");
        return (
          <div
            className="grid grid-cols-4 gap-2 border border-gray-300 p-2"
            key={address.id}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id={"delivery_address_" + address.id}
                className="w-4 h-4"
                value={address.id}
                name="address_id"
                checked={addressId === address.id}
                onChange={() => handleChangeRadios(address.id)}
              />
              <label
                htmlFor={"delivery_address_" + address.id}
                className="text-sm"
              >
                <span className="font-semibold block">{fullName}</span>
                <span className="block">{address.phone}</span>
              </label>
            </div>
            {/* Nút xoá đã gỡ 2026-09-29: BE không có `DELETE /api/v1/addresses/{id}` (sổ địa chỉ chỉ đọc). */}
            <div className="text-sm col-span-3">{line}</div>
          </div>
        );
      })}
      <p
        onClick={handleOtherAddress}
        className="inline-block mt-2 px-3 py-1 md:text-sm font-semibold font-body rounded-md cursor-pointer  hover:underline transition ease-in-out duration-300"
      >
        Other Address ...
      </p>
    </div>
  );
};
export default CheckoutList;
