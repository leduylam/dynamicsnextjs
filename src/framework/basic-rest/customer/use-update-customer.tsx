// import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
// import http from "@framework/utils/http";
import { useMutation } from "@tanstack/react-query";

export interface UpdateUserType {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
}
async function updateUser(input: UpdateUserType) {
  // return http.post(API_ENDPOINTS.ChangeEmail, input);
  return input;
}
export const useUpdateUserMutation = () => {
  return useMutation({
    mutationFn: (input: UpdateUserType) => updateUser(input),
    onSuccess: (data) => {
      console.log(data, "UpdateUser success response");
    },
    onError: (data) => {
      console.log(data, "UpdateUser error response");
    },
  });
};
