
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation } from "@tanstack/react-query";

export interface RegisterInputType {
    url: string;
    name: string;
}
async function registerApi(input: RegisterInputType) {
    const response = await http.post(API_ENDPOINTS.REGISTERAPI, input);
    return response?.data;
}
export const useRegisterApiMutation = () => {
    return useMutation({
        mutationFn: (input: RegisterInputType) => registerApi(input)
    });
};
