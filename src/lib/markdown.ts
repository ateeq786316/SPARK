function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(input: string): string {
  return escapeHtml(input)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Converts a subset of Markdown (headings, bold/italic, inline code, links,
// images, lists, blockquotes, fenced + indented code, hr, paragraphs, breaks)
// into an HTML string. Dependency-free, safe for trusted author input.
export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let i = 0;

  const renderInline = (text: string): string => {
    let out = text;
    // inline code wins
    out = out.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
    // images: ![alt](src)
    out = out.replace(
      /!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_, alt, src) =>
        `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" />`
    );
    // links
    out = out.replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, label, href) =>
        `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
    );
    // bold ** ** / __ __
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    // italic * * / _ _
    out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
    out = out.replace(/(^|[^_])_([^_]+)_(?!_)/g, "$1<em>$2</em>");
    // inline references to bold/strong that lost escapes through nesting: re-escape leftover tags
    return escapeHtmlForInline(out);
  };

  // escape remaining raw HTML after inline tag insertion
  const escapeHtmlForInline = (s: string): string => {
    const tags = s.match(/<(\/?)(code|strong|em|a|img)([^>]*)>/g);
    if (!tags) return escapeHtml(s);
    let out = s.replace(/<\/?code>|<\/?strong>|<\/?em>|<\/?a>|<\/?img[^>]*>/g, "\u0000");
    out = escapeHtml(out);
    let idx = 0;
    return out.replace(/\u0000/g, () => tags[idx++]);
  };

  const flushPara = (buf: string) => {
    const text = buf.trim();
    if (!text) return;
    html.push(`<p>${renderInline(text)}</p>`);
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.replace(/\s+$/, "");

    // fenced code block
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      const lang = fence[2].trim();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^ {0,3}(`{3,}|~{3,})/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence
      const code = escapeHtml(body.join("\n"));
      const cls = lang ? ` class="language-${escapeAttr(lang)}"` : "";
      html.push(`<pre><code${cls}>${code}</code></pre>`);
      continue;
    }

    // blockquote
    if (/^ {0,3}>/.test(line)) {
      const content: string[] = [];
      while (i < lines.length && /^ {0,3}>/.test(lines[i])) {
        content.push(lines[i].replace(/^ {0,3}>\s?/, ""));
        i += 1;
      }
      const inner = renderInline(content.join(" ").trim());
      html.push(`<blockquote>${inner}</blockquote>`);
      continue;
    }

    // ATX headings
    const heading = line.match(/^ {0,3}(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    // thematic break
    if (/^ {0,3}(\*{3,}|- {0,3}- {0,3}-|_\s*_)/.test(line)) {
      html.push("<hr />");
      i += 1;
      continue;
    }

    // list item
    const ulItem = line.match(/^ {0,3}[-+*]\s+(.*)$/);
    const olItem = line.match(/^ {0,3}\d+\.\s+(.*)$/);
    if (ulItem || olItem) {
      const ordered = !!olItem;
      const tag = ordered ? "ol" : "ul";
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].match(/^ {0,3}[-+*]\s+/) ||
          lines[i].match(/^ {0,3}\d+\.\s+/) ||
          /^ {2,}/.test(lines[i]))
      ) {
        const liMatch = lines[i].match(/^ {0,3}[-+*]\s+(.*)$/) ||
          lines[i].match(/^ {0,3}\d+\.\s+(.*)$/);
        if (liMatch) {
          items.push(`<li>${renderInline(liMatch[1])}</li>`);
        }
        i += 1;
      }
      html.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    // blank line flushes paragraph
    if (/^\s*$/.test(line)) {
      i += 1;
      continue;
    }

    // indented code block (4+ spaces)
    if (/^ {4}/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && (/^ {4}/.test(lines[i]) || /^\s*$/.test(lines[i]))) {
        body.push(lines[i].replace(/^ {4}/, ""));
        i += 1;
      }
      html.push(`<pre><code>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    // regular paragraph text — accumulate consecutive non-blank lines
    const buf: string[] = [];
    while (i < lines.length && !/^\s*$/.test(lines[i])) {
      // stop if we hit a construct line
      const l = lines[i];
      if (
        /^ {0,3}(`{3,}|~{3,})/.test(l) ||
        /^ {0,3}>/.test(l) ||
        /^ {0,3}#{1,6}\s/.test(l) ||
        /^ {0,3}(\*{3,}|- {0,3}- {0,3}-)/.test(l) ||
        l.match(/^ {0,3}[-+*]\s+/) ||
        l.match(/^ {0,3}\d+\.\s+/)
      ) {
        break;
      }
      buf.push(l.replace(/^( {0,3})*/, ""));
      i += 1;
    }
    const para = buf.join("  \n");
    html.push(`<p>${renderInline(para)}</p>`);
    flushPara(""); // noop placeholder
  }

  return html.join("\n");
}

export const articleTemplate = `# Your article title

Published in: \`Success Stories\`

Start here. Delete this line and write your story.

## A short subheading (optional)

The first **paragraph** should hook the reader — keep it tight, ~1–2 sentences.

### Why this matters

Connect the opportunity to a real outcome. Use concrete numbers and a quote:

> "I applied to 3 programs and was accepted to 2. The biggest factor was…"

- Point one
- Point two
- Point three

## How to apply / what to do next

Give the reader a clear takeaway or call to action.

\`\`\`text
# A code note can live here
\`\`\`

[SPARK Opportunities](/opportunities) — link to relevant listings.
`;
