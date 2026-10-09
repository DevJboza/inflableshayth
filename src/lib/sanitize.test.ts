import { describe, expect, it } from "vitest";
import { cleanEmailHtml } from "./sanitize";

describe("cleanEmailHtml", () => {
  it("conserva estilos de correo y elimina scripts", () => {
    const result = cleanEmailHtml(
      '<html><head><style>.card{color:#8456ae}</style><script>alert(1)</script></head><body><table role="presentation"><tr><td class="card">Catálogo</td></tr></table></body></html>',
    );
    expect(result).toContain("<style>");
    expect(result).toContain('role="presentation"');
    expect(result).not.toContain("<script>");
  });
});
