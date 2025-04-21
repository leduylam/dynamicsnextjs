export function prepareTableHTML(html: string): string {
  if (!html) return "";

  // DOMParser chỉ chạy ở browser (client side)
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("table").forEach((table) => {
    const wrapper = doc.createElement("div");
    wrapper.className = "table-scroll overflow-auto my-4";
    const isNested = [...doc.querySelectorAll("table")].some(
      (outerTable) => outerTable !== table && outerTable.contains(table)
    );
    table.classList.add(`w-full ${isNested ? "table-inner" : "table-striped"}`);
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  return doc.body.innerHTML;
}
