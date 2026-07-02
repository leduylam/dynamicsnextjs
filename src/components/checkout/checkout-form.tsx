import Input from "@components/ui/input";
import { Controller, useForm } from "react-hook-form";
import TextArea from "@components/ui/text-area";
import {
  useCheckoutMutation,
  CheckoutInputType,
} from "@framework/checkout/use-checkout";
import { CheckBox } from "@components/ui/checkbox";
import Button from "@components/ui/button";
import {
  useDeliveryAddressQuery,
  Address,
} from "@framework/checkout/get-all-address";
import { useCompanyQuery } from "@framework/company/get-company";
import { useEffect, useState } from "react";
import CheckoutList from "./checkout-list";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { ROUTES } from "@utils/routes";
import Select from "react-select";
import { useCheckAccess } from "src/framework/auth/checkAccess";
import Tooltip from "@components/ui/tooltip";
import { toast } from "react-toastify";

const CheckoutForm: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: placeOrder, isPending } = useCheckoutMutation();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInputType>({
    defaultValues: { shippingCountry: "VN", saveAddress: false },
  });
  const { data: deliveryAddress } = useDeliveryAddressQuery();
  const { data: companyData } = useCompanyQuery();
  const [isFormVisible, setIsFormVisible] = useState(
    deliveryAddress ? deliveryAddress.length === 0 : false,
  );
  const [addressId, setAddressId] = useState<number | null>(null);
  const [companyOptions, setCompanyOptions] = useState([
    { value: "", label: "— None (optional) —" },
  ]);
  const canSelectCompany = useCheckAccess(["admin", "super-admin", "sale"], []);

  // Đổ địa chỉ đã lưu vào form fields (BE đọc field, KHÔNG nhận address_id).
  const populateFromAddress = (a: Address) => {
    setValue(
      "name",
      a.name || `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim(),
    );
    setValue("email", a.email ?? "");
    setValue("phone", a.phone ?? "");
    setValue("company", a.company ?? "");
    setValue("shippingAddressLine1", a.address_line_1 ?? "");
    setValue("shippingCity", a.city ?? "");
    setValue("shippingStateProvince", a.state_province ?? "");
    setValue("shippingCountry", a.country ?? "VN");
  };

  function onSubmit(input: CheckoutInputType) {
    // Saved address có thể thiếu field (name/phone/email/city/state) — được tạo
    // từ path khác (dashboard order / profile) không bắt buộc đủ như checkout.
    // Khi chọn address kiểu đó, form bị ẩn nên user không thấy field trống →
    // Place Order gửi rỗng → BE 422 khó hiểu. Chặn tại client: mở form editable
    // (đã pre-fill phần có sẵn) để user điền nốt trước khi đặt.
    const requiredFields: Array<{
      key: keyof CheckoutInputType;
      label: string;
    }> = [
      { key: "name", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "shippingAddressLine1", label: "Address" },
      { key: "shippingCity", label: "City" },
      { key: "shippingStateProvince", label: "State/Province" },
      { key: "shippingCountry", label: "Country" },
    ];
    const missing = requiredFields.filter(
      (f) => !String(input[f.key] ?? "").trim(),
    );
    if (missing.length > 0) {
      setIsFormVisible(true);
      toast.error(`Please complete: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    // input đã đúng contract BE (shipping fields phẳng). Cart server-side.
    placeOrder(input, {
      onSuccess: () => {
        // BE xoá cart items trong checkout — chỉ invalidate để UI cập nhật.
        queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CARTS] });
        router.push(ROUTES.ORDERS);
      },
    });
  }

  useEffect(() => {
    if (companyData && Array.isArray(companyData.companies)) {
      const mapped = companyData.companies.map(
        (c: { company_code: string }) => ({
          value: c.company_code,
          label: c.company_code,
        }),
      );
      setCompanyOptions([
        { value: "", label: "— None (optional) —" },
        ...mapped,
      ]);
    }
  }, [companyData]);

  useEffect(() => {
    if (deliveryAddress && deliveryAddress.length > 0 && addressId === null) {
      setAddressId(deliveryAddress[0].id);
      populateFromAddress(deliveryAddress[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryAddress, addressId]);

  const handleChangeRadios = (id: number | null) => {
    setAddressId(id);
    const a =
      id != null ? deliveryAddress?.find((x) => x.id === id) : undefined;
    if (a) populateFromAddress(a);
  };
  const handleOtherAddress = () => {
    setIsFormVisible(true);
    setAddressId(null);
  };
  const handleCancelForm = () => {
    setIsFormVisible(false);
  };
  return (
    <>
      <h2 className="text-lg md:text-xl xl:text-2xl font-bold text-heading mb-6 xl:mb-8">
        Shipping Address
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full mx-auto flex flex-col justify-center "
        noValidate
      >
        <div className="flex flex-col space-y-4 lg:space-y-5">
          {deliveryAddress && deliveryAddress.length && !isFormVisible ? (
            <CheckoutList
              items={deliveryAddress}
              handleOtherAddress={handleOtherAddress}
              handleChangeRadios={handleChangeRadios}
              addressId={addressId}
            />
          ) : (
            <>
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0">
                <Input
                  labelKey="Name *"
                  {...register("name", { required: "Name is required" })}
                  errorKey={errors.name?.message}
                  variant="solid"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0">
                <Input
                  type="tel"
                  labelKey="Phone *"
                  {...register("phone", { required: "Phone is required" })}
                  errorKey={errors.phone?.message}
                  variant="solid"
                  className="w-full lg:w-1/2 "
                />
                <Input
                  type="email"
                  labelKey="Email *"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      message: "Please provide valid email address",
                    },
                  })}
                  errorKey={errors.email?.message}
                  variant="solid"
                  className="w-full lg:w-1/2 ltr:lg:ml-3 rtl:lg:mr-3 mt-2 md:mt-0"
                />
              </div>
              <Input
                labelKey="Address *"
                {...register("shippingAddressLine1", {
                  required: "Address is required",
                })}
                errorKey={errors.shippingAddressLine1?.message}
                variant="solid"
              />
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0">
                <Input
                  labelKey="City *"
                  {...register("shippingCity", {
                    required: "City is required",
                  })}
                  errorKey={errors.shippingCity?.message}
                  variant="solid"
                  className="w-full lg:w-1/2 "
                />
                <Input
                  labelKey="State / Province *"
                  {...register("shippingStateProvince", {
                    required: "State/Province is required",
                  })}
                  errorKey={errors.shippingStateProvince?.message}
                  variant="solid"
                  className="w-full lg:w-1/2 ltr:lg:ml-3 rtl:lg:mr-3 mt-2 md:mt-0"
                />
              </div>
              <div className="w-full">
                <label className="block text-body-dark font-semibold text-sm leading-none mb-3">
                  Country *
                </label>
                <select
                  {...register("shippingCountry", {
                    required: "Country is required",
                  })}
                  className="px-4 h-12 flex items-center w-full rounded appearance-none transition duration-300 ease-in-out text-heading text-sm focus:outline-none focus:ring-0 border border-gray-300 focus:border-2 focus:border-heading"
                >
                  <option value="VN">Vietnam</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                </select>
                {errors.shippingCountry?.message && (
                  <p className="my-2 text-xs text-red-500">
                    {errors.shippingCountry.message}
                  </p>
                )}
              </div>
              <div className="relative flex items-center justify-between ">
                <CheckBox
                  labelKey="Save this information for next time"
                  {...register("saveAddress")}
                />
                {deliveryAddress && deliveryAddress.length && (
                  <p
                    onClick={handleCancelForm}
                    className="cursor-pointer text-sm font-semibold hover:underline text-red-500"
                  >
                    Cancel
                  </p>
                )}
              </div>
            </>
          )}
          {canSelectCompany && (
            <>
              <Tooltip text="The selected company will be used for reports">
                <label className="text-sm font-semibold cursor-pointer">
                  Select Company
                </label>
              </Tooltip>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <Select
                    className="mt-0"
                    placeholder="Select Company (optional)"
                    options={companyOptions ?? []}
                    onChange={(val) => field.onChange(val ? val.value : null)}
                  />
                )}
              />
            </>
          )}

          <TextArea
            labelKey="Order Notes (Optional)"
            {...register("customerNote")}
            placeholderKey="Notes about your order, e.g. special notes for delivery"
            className="relative pt-3 xl:py-6 "
          />
          <div className="flex w-full">
            <Button
              className="w-full sm:w-auto bg-blue-700 hover:bg-blue-600"
              loading={isPending}
              disabled={isPending}
            >
              Place Order
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default CheckoutForm;
