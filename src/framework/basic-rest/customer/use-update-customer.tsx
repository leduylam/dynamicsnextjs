import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import http from "@framework/utils/http";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 * Cập nhật hồ sơ — `PUT /api/auth/jwt/profile` (qua proxy same-origin `/api/auth/jwt/*`).
 * Trước 2026-09-29 hàm này KHÔNG gọi API (trả lại input) ⇒ khách bấm Lưu mà không có gì được ghi.
 * Đổi email bắt buộc `current_password` (BE trả 422 `errors.current_password` nếu thiếu/sai).
 */
export interface UpdateUserType {
  name: string;
  phone: string;
  email: string;
  address: string;
  current_password?: string;
}

interface UpdateUserResponse {
  data: {
    message?: string;
    data?: { name?: string; email?: string; phone?: string; address?: string };
  };
}

async function updateUser(input: UpdateUserType): Promise<UpdateUserResponse> {
  return http.put(API_ENDPOINTS.PROFILE, input);
}

export const useUpdateUserMutation = (
  onSaved?: (saved: { name?: string; email?: string; phone?: string; address?: string }) => void,
) => {
  return useMutation({
    mutationFn: (input: UpdateUserType) => updateUser(input),
    onSuccess: (response) => {
      toast(response.data.message ?? "", { autoClose: 2000 });
      onSaved?.(response.data.data ?? {});
    },
  });
};
