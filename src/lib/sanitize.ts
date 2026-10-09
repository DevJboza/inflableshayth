import sanitizeHtml from "sanitize-html";
export function cleanEmailHtml(html: string) {
  return sanitizeHtml(html, {
    // Templates are authored only by the authenticated administrator and are
    // rendered in a sandboxed iframe. CSS is required for responsive email.
    allowVulnerableTags: true,
    allowedTags: [
      "html",
      "head",
      "meta",
      "title",
      "style",
      "body",
      "p",
      "br",
      "div",
      "span",
      "table",
      "tbody",
      "tr",
      "td",
      "h1",
      "h2",
      "h3",
      "strong",
      "em",
      "a",
      "img",
      "ul",
      "ol",
      "li",
      "hr",
    ],
    allowedAttributes: {
      html: ["lang"],
      meta: ["charset", "name", "content"],
      table: ["role", "cellspacing", "cellpadding", "border", "width", "style"],
      td: ["align", "bgcolor", "height", "style", "class"],
      a: ["href", "style", "target"],
      img: ["src", "alt", "width", "height", "style"],
      "*": ["style", "align", "class"],
    },
    allowedSchemes: ["https", "mailto"],
  });
}
