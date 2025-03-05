import Input from '@components/ui/input';
import Button from '@components/ui/button';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRegisterApiMutation } from '@framework/auth/use-register-api';
interface RegisterApiProps {
    'name': string,
    'url': string
}
const RegisterApiForm: React.FC = () => {
    
    const { t } = useTranslation();
    const [response, setResponse] = useState<any>(null);
    const [_, setError] = useState<string | null>(null);
    const [errorServer, setErrorServer] = useState<string | null>(null)
    const { mutate: registerApi, isPending } = useRegisterApiMutation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RegisterApiProps>();
    function onSubmit({ name, url }: RegisterApiProps) {
        try {
            registerApi({ name, url },
                {
                    onSuccess: (data) => {
                        setResponse(data)
                        reset()
                    }, onError: (error: any) => {
                        if (error.response && error.response.status === 403) {
                            setErrorServer(error.response.data.message)
                        }
                    },
                }
            );
        } catch (error) {
            setError('Invalid credentials. Please try again.');
        }
    }
    return (
        <>
            <div className="w-full px-5 py-5 mx-auto overflow-hidden bg-white border border-gray-300 rounded-lg sm:w-96 md:w-450px sm:px-8 mb-10">
                <div className="text-center mb-6 pt-2.5">
                    <p className="mt-2 text-sm md:text-base text-body">
                        Connection port for integration with other systems
                    </p>
                    {errorServer && (
                        <p className='text-sm text-red-500 italic'>{errorServer}</p>
                    )}
                </div>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col justify-center"
                    noValidate
                >
                    <div className="flex flex-col space-y-3.5">
                        <Input
                            labelKey="App name"
                            type="text"
                            variant="solid"
                            placeholder='Enter your app/web name'
                            {...register('name', {
                                required: `App name is required`,
                            })}
                            errorKey={errors.name?.message}
                        />
                        <Input
                            labelKey="URL webhook"
                            type='text'
                            variant="solid"
                            placeholder='Enter your webhook url'
                            {...register('url', {
                                required: `Password is required`,
                            })}
                        />
                        <p className='text-sm italic'>Khi đăng ký webhook URL, sự kiện webhook mặc định sẽ là update_stock. Mỗi khi tồn kho được cập nhật, một yêu cầu sẽ được gửi đến URL đã đăng ký để thông báo về sự thay đổi.</p>
                        <div className="relative">
                            <Button
                                type="submit"
                                loading={isPending}
                                disabled={isPending}
                                className="h-11 md:h-12 w-full mt-1.5"
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
            {response && (
                <div className="w-full px-5 py-5 mx-auto overflow-hidden bg-white border border-gray-300 rounded-lg sm:px-8 mb-10">
                    <p className='text-lg pb-2'>Tham số sinh token</p>
                    <div>
                        <pre className='bg-black text-white px-2 pt-1'>
                            <code>
                                {`{
  "client_id": "${response?.client_id}",
  "client_secret": "${response?.client_secret}"
}`}
                            </code>
                        </pre>
                    </div>

                </div>
            )}
            <div className="w-full px-5 py-5 mx-auto overflow-hidden bg-white border border-gray-300 rounded-lg sm:px-8">
                <div className='mb-10'>
                    <h2 className='text-xl mb-5'>Xác thực</h2>
                    <div className='mb-10'>
                        <p>Sau khi đăng ký thành công, chúng tôi sẽ cung cấp client_id và client_secret, được hiển thị ngay trên trang này để bạn sử dụng trong quá trình xác thực và lấy token</p>
                        <pre className='bg-black text-white px-2 pt-1'>
                            <code>
                                {`{
  "client_id": "string",
  "client_secret": "string"
}`}
                            </code>
                        </pre>
                    </div>
                    <div>
                        <p>Quy trình các bước thực hiện sinh token để sử dụng API:</p>
                        <p className='font-semibold'>Bước 1: Sinh token bằng api Account (sử dụng AppID và mã bảo mật do CRM cung cấp làm tham số đầu vào) và sao chép kết quả đoạn mã api trả ra</p>
                        <pre className='bg-black text-white px-2 pt-1 mb-10'>
                            <code className="language-bat">curl <span className="token operator">--</span>location <span className="token operator">--</span>request POST <span className="text-green-600">{`'https://api.dynamicsportsvn.com/api/v2/account'`}</span> \<br />
                                <span className="token operator">--</span>header <span className="text-green-600">{`'Content-Type: application/json'`}</span> \<br />
                                <span className="token operator">--</span>data<span className="text-green-600">{`{`}</span><br />
                                <span className="ml-24 text-green-600">{`"client_id"`}</span><span className="text-green-600">:</span> <span className="text-green-600">{`"PublicAPI"`}</span><span className="text-green-600">,</span><br />
                                <span className="ml-24 text-green-600">{`"client_secret"`}</span><span className="text-green-600">:</span> <span className="text-green-600">{`{"zrt8J3MqqWEmdrL+oXldGuQbaIuETNVE5k6uQuPLIEc="}`}</span><br />
                                <span className="text-green-600">{`}`}</span>
                            </code>
                        </pre>
                        <p>Response</p>
                        <pre className='bg-black text-white px-2 pt-1 overflow-x-auto mb-10'>
                            <code>
                                {`{
    "status": true
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAiLCJzdWIiOjIsImlhdCI6MTc0MDY0MzA5MiwiZXhwIjoxNzQxODUyNjkyfQ.sHF6v0s2V8srB7T2yagiB-PGAEHOlcZMhSI0BjLFBS4"
}`}
                            </code>
                        </pre>
                        <p className='mb-5 font-semibold'>Bước 2: Thêm header Authorization: Bearer {`{token}`} vào các request {`{ get-products }`} xử lý dữ liệu và thực hiện gọi api danh sách sản phẩm có phân trang </p>
                        <pre className='bg-black text-white px-2 pt-1 overflow-x-auto'>
                            <code className="language-bat">curl <span className="token operator">--</span>location <span className="token operator">--</span>request GET <span className="text-green-600">{`'https://api.dynamicsportsvn.com/api/v2/get-products'`}</span> \<br />
                                <span className="token operator">--</span>header <span className="text-green-600">{`'Content-Type: application/json'`}</span> \<br />
                                <span className="token operator">--</span>data <span className="text-green-600">{`{`}</span><br />
                                <span className="ml-24 text-green-600">{`"client_id"`}</span><span className="text-green-600">:</span> <span className="text-green-600">{`"PublicAPI"`}</span><span className="text-green-600">,</span><br />
                                <span className="ml-24 text-green-600">{"client_secret"}</span><span className="text-green-600">:</span> <span className="text-green-600">{`"zrt8J3MqqWEmdrL+oXldGuQbaIuETNVE5k6uQuPLIEc="`}</span><br />
                                <span className="text-green-600">{`}`}</span>
                            </code>
                        </pre>
                    </div>
                </div>
                <div>
                    <div className='grid grid-cols-2 items-center gap-2'>
                        <div className="mb-10">
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                {/* Tiêu đề */}
                                <h2 className="text-lg font-semibold text-gray-800">
                                    <a href="#tag/Products/paths/~1api~1v2~1Products/get">
                                        Paging lấy về danh sách có phân trang
                                    </a>
                                </h2>

                                {/* Mô tả */}
                                <div className="mt-2 text-gray-600">
                                    <p>page bắt đầu từ 1, perpage mặc định là 20, orderBy mặc định là theo id desc</p>
                                </div>

                                {/* Authorization */}
                                <div className="mt-4 flex items-center">
                                    <h5 className="text-gray-700 font-semibold">Authorizations:</h5>
                                    <span className="ml-2 text-blue-600">
                                        <a href="#section/Authentication/Bearer">Bearer</a>
                                    </span>
                                </div>

                                {/* Query Parameters */}
                                <h5 className="mt-6 text-gray-700 font-semibold">QUERY PARAMETERS</h5>
                                <table className="w-full border border-gray-300 mt-2">
                                    <tbody>
                                        <tr className="border border-gray-300">
                                            <td className="p-2 font-medium text-gray-800">page</td>
                                            <td className="p-2">
                                                <span className="text-gray-500">integer</span>
                                                <p className="text-gray-600 text-sm">Trang muốn xem</p>
                                            </td>
                                        </tr>

                                        <tr className="border border-gray-300">
                                            <td className="p-2 font-medium text-gray-800">perpage</td>
                                            <td className="p-2">
                                                <span className="text-gray-500">integer</span>
                                                <div className="text-gray-600 text-sm">
                                                    <span className="font-medium">Default:</span> 10
                                                </div>
                                                <p className="text-gray-600 text-sm">Số bản ghi trên 1 trang</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className='w-full'>
                            <div className="bg-black text-white p-4 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm">
                                    <code>
                                        {`{
    "success": true,
    "code": 200,
    "data": {
        "products": [],
        "link": [],
        "current_page": 1,
        "last_page": 10
    },
    "error_message": "string"
}`}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <p></p>
                </div>
            </div>
        </>
    );
};

export default RegisterApiForm;
