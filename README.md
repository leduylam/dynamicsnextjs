# ⚡ Dự án `dynamicsportsvn`

### Website chính thức của **CÔNG TY TNHH THỂ THAO NĂNG ĐỘNG**

---

## 🧾 Giới thiệu

`dynamicsportsvn` là nền tảng thương mại điện tử được phát triển riêng cho Công ty TNHH Thể Thao Năng Động, sử dụng các công nghệ hiện đại như `Next.js`, `React`, `TypeScript`, `Tailwind CSS` và `@tanstack/react-query`.  
Hệ thống được tối ưu cho tốc độ, trải nghiệm người dùng và khả năng mở rộng về sau.

---

## ✅ Yêu cầu hệ thống

- **Node.js** `>= 20.16.0`
- **npm** (đi kèm Node; lockfile chuẩn là `package-lock.json`)
- **Trình soạn thảo đề xuất**: Visual Studio Code

---

## 🛠 Công nghệ sử dụng

| Công nghệ                                           | Vai trò                             |
| --------------------------------------------------- | ----------------------------------- |
| [React](https://reactjs.org/)                       | Thư viện xây dựng giao diện         |
| [Next.js](https://nextjs.org/)                      | Framework React hỗ trợ SSR, SSG     |
| [TypeScript](https://www.typescriptlang.org/)       | Kiểu dữ liệu tĩnh giúp code ổn định |
| [@tanstack/react-query](https://tanstack.com/query) | Quản lý data fetching               |
| [Axios](https://axios-http.com/)                    | Thư viện gọi API                    |
| [Tailwind CSS](https://tailwindcss.com/)            | Framework CSS tiện lợi              |

---

## 🚀 Cài đặt & Chạy dự án

### Bước 1: Tạo file `.env.local`

```bash
cp .env.local.template .env.local
```

Cập nhật các biến môi trường cho đúng API backend.

### Bước 2: Cài đặt thư viện

```bash
npm ci
```

### Bước 3: Chạy dev

```bash
npm run dev -- -p 3003
```

Cổng 3003 (cổng của client-dsc trong cụm dev chạy chung với các app khác).

### Bước 4: Build & start production

```bash
npm run build
npm start
```

---

## 🗂 Cấu trúc thư mục

```
.
├── public/
├── src/
│   ├── components/
│   ├── containers/
│   ├── contexts/
│   ├── framework/
│   ├── pages/
│   ├── settings/
│   ├── styles/
│   └── utils/
├── .env.local
├── tailwind.config.js
├── tsconfig.json
└── next.config.ts
```

---

## 🌍 Đa ngôn ngữ

- Dùng `next-i18next`
- Thư mục `public/locales/` chứa các tệp ngôn ngữ.

---

## 🔁 RTL

Tuỳ chỉnh trong `src/utils/get-direction.ts`

---

## 🔌 Data fetching

Ví dụ hook gọi sản phẩm:

```tsx
import { Product } from "@framework/types";
import http from "@framework/utils/http";
import { API_ENDPOINTS } from "@framework/utils/api-endpoints";
import { useQuery } from "@tanstack/react-query";

export const fetchProduct = async (_slug: string) => {
  const { data } = await http.get(`${API_ENDPOINTS.PRODUCT}`);
  return data;
};

export const useProductQuery = (slug: string) => {
  return useQuery<Product, Error>({
    queryKey: [API_ENDPOINTS.PRODUCT, slug],
    queryFn: () => fetchProduct(slug),
  });
};
```

---

## ⚙️ Tuỳ chỉnh cấu hình

| File / thư mục       | Vai trò                    |
| -------------------- | -------------------------- |
| `tailwind.config.js` | Tuỳ chỉnh Tailwind         |
| `site-settings.ts`   | Logo, menu,...             |
| `tsconfig.json`      | Cấu hình TypeScript        |
| `public/`            | Ảnh, favicon, dữ liệu tĩnh |

---

## 🚚 Triển khai

Production chạy trên VPS bằng pm2, build ngay trên VPS (biến `NEXT_PUBLIC_*` được inline lúc build).

---

## 🔐 Ghi chú

> Dự án thuộc sở hữu và phát triển bởi **Công ty TNHH Thể Thao Năng Động**.

## 💬 Liên hệ

- Email: duylam@dynamicsportsvn.com
- Website: [https://dynamicsportsvn.com]
