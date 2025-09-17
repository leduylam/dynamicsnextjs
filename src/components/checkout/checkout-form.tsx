import Input from "@components/ui/input";
import { Controller, useForm } from "react-hook-form";
import TextArea from "@components/ui/text-area";
import { useCheckoutMutation } from "@framework/checkout/use-checkout";
import { CheckBox } from "@components/ui/checkbox";
import Button from "@components/ui/button";
import { useDeliveryAddressQuery } from "@framework/checkout/get-all-address";
import { useCompanyQuery } from "@framework/company/get-company";
import { useEffect, useState } from "react";
import CheckoutList from "./checkout-list";
import { useCartQuery } from "@framework/carts/get-all-cart";
import { clearItemFromCart } from "@framework/carts/get-delete-cart";
import { useRouter } from "next/router";
import { ROUTES } from "@utils/routes";
import Select from "react-select";
import { useCheckAccess } from "src/framework/auth/checkAccess";
import Tooltip from "@components/ui/tooltip";

interface CheckoutInputType {
  address_id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  save: boolean;
  note: string;
  total: string;
  company_id: string | null;
  orderItem: [];
}

const CheckoutForm: React.FC = () => {
  const router = useRouter();
  const { mutate: updateUser, isPending } = useCheckoutMutation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutInputType>();
  const { data } = useCartQuery();
  const { data: deliveryAddress } = useDeliveryAddressQuery();
  const { data: companyData } = useCompanyQuery();
  const [isFormVisible, setIsFormVisible] = useState(
    deliveryAddress ? deliveryAddress.length === 0 : false
  );
  const [addressId, setAddressId] = useState<number | null>(null);
  const [companyOptions, setCompanyOptions] = useState([
    { value: "", label: "Select Company" },
  ]);
  const canSelectCompany = useCheckAccess(["admin", "super-admin", "sale"], []);
  function onSubmit(input: CheckoutInputType) {
    const checkoutInput = {
      ...input,
      address_id: addressId,
      items: data?.items,
      total: data?.total,
    };
    updateUser(checkoutInput, {
      onSuccess: () => {
        if (Array.isArray(data?.items)) {
          for (const item of data?.items) {
            clearItemFromCart(item.id);
          }
        }
        router.push(ROUTES.ORDERS);
      },
    });
  }
  useEffect(() => {
    if (companyData && Array.isArray(companyData.companies)) {
      const mapped = companyData.companies.map((c: any) => ({
        value: c.id.toString(),
        label: c.company_code,
      }));

      setCompanyOptions(mapped);
    }
  }, [companyData]);

  const handleChangeRadios = (id: number | null) => {
    setAddressId(id);
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
            />
          ) : (
            <>
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0">
                <Input
                  labelKey="Name *"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  errorKey={errors.name?.message}
                  variant="solid"
                  className="w-full"
                />
              </div>
              <Input
                labelKey="Address *"
                {...register("address", {
                  required: "Address is required",
                })}
                errorKey={errors.address?.message}
                variant="solid"
              />
              <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0">
                <Input
                  type="tel"
                  labelKey="Phone *"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
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
              <div className="relative flex items-center justify-between ">
                <CheckBox
                  labelKey="Save this information for next time"
                  {...register("save")}
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
                name="company_id"
                control={control}
                rules={{ required: "Company is required" }}
                render={({ field }) => (
                  <Select
                    className="mt-0"
                    placeholder="Select Company"
                    options={companyOptions ?? []}
                    onChange={(val) =>
                      field.onChange(val ? (val as any).value : null)
                    }
                  />
                )}
              />
            </>
          )}

          <TextArea
            labelKey="Order Notes (Optional)"
            {...register("note")}
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
