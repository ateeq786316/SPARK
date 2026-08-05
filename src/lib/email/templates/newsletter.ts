import "server-only";

interface NewsletterTemplateInput {
  title: string;
  htmlContent: string;
  unsubscribeUrl: string;
  siteUrl: string;
}

export function renderNewsletterEmail({
  title,
  htmlContent,
  unsubscribeUrl,
  siteUrl,
}: NewsletterTemplateInput): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f0;color:#18181b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<center role="article" aria-roledescription="email" lang="en" style="width:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <span style="display:inline-flex;align-items:center;gap:8px;font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#18181b;">
                  <span style="display:inline-block;width:26px;height:26px;border-radius:7px;background-color:#b45309;vertical-align:middle;"></span>
                  SPARK
                </span>
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;padding:40px 32px;text-align:left;">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;letter-spacing:-0.02em;color:#18181b;">${title}</h1>
              ${htmlContent}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 16px 0;font-size:12px;line-height:1.8;color:#a1a1aa;">
              You are receiving this because you subscribed to the SPARK newsletter.<br>
              <a href="${unsubscribeUrl}" style="color:#a1a1aa;text-decoration:underline;">Unsubscribe</a> ·
              <a href="${siteUrl}" style="color:#a1a1aa;text-decoration:underline;">Visit SPARK</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</center>
</body>
</html>`;
}
