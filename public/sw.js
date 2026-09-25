/*
 * Service worker KILL-SWITCH — KHÔNG đăng ký ở đâu cả, chỉ để thay SW cũ.
 *
 * Trước 2026-09-25 storefront dùng next-pwa: /sw.js cache cả response API
 * admin-vgd (cross-origin NetworkFirst 1h, kể cả bản có Bearer). next-pwa đã gỡ
 * (M45); trình duyệt từng đăng ký SW cũ sẽ tải lại /sw.js khi kiểm tra cập nhật,
 * nhận bản này ⇒ xoá toàn bộ Cache Storage, tự unregister, rồi tải lại các tab
 * để trang đi thẳng mạng, không qua SW. 404 thay vì file này KHÔNG đủ: spec không
 * bảo đảm tự gỡ SW khi cập nhật lỗi.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: "window" });
      await Promise.all(windows.map((client) => client.navigate(client.url)));
    })(),
  );
});
