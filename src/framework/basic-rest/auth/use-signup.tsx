import { useMutation } from "@tanstack/react-query";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export interface SignUpInputType {
  email: string;
  password: string;
  name: string;
  confirmPassword: string
}
async function signUp(input: SignUpInputType) {
  return http.post(API_ENDPOINTS.REGISTERS, input);
}
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (input: SignUpInputType) => signUp(input),
  });
};
