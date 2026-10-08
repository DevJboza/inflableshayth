import sanitizeHtml from "sanitize-html";
export function cleanEmailHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
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
      a: ["href", "style", "target"],
      img: ["src", "alt", "width", "height", "style"],
      "*": ["style", "align"],
    },
    allowedSchemes: ["https", "mailto"],
  });
}
