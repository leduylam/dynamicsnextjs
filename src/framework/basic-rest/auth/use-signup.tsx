import { useMutation } from "@tanstack/react-query";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";

export interface SignUpInputType {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}
async function signUp(input: SignUpInputType) {
  // admin-vgd kỳ vọng password_confirmation thay cho confirmPassword.
  return http.post(API_ENDPOINTS.REGISTERS, {
    name: input.name,
    email: input.email,
    password: input.password,
    password_confirmation: input.confirmPassword,
  });
}
export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (input: SignUpInputType) => signUp(input),
  });
};
