
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { name, email, company, website, budget, subject, message, _honey } = data;

    // 1. Honeypot check
    if (_honey) {
      return new Response(JSON.stringify({ success: true, message: "Spam detected." }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 2. Server-side validation
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 3. Construct Branded HTML Email
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'UTC' });
    const internalRecipient = "hello@fluxwebstudio.com";
    const senderAddr = "no-reply@fluxwebstudio.com";
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: 'Inter', -apple-system, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; line-height: 1.6; }
          .header { padding: 32px; background-color: #030712; color: #ffffff; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 40px; border: 1px solid #e5e7eb; border-top: none; background-color: #ffffff; }
          .footer { padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; }
          .field-label { font-weight: 700; color: #0891b2; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
          .field-value { margin-bottom: 24px; font-size: 16px; color: #374151; }
          .divider { height: 1px; background-color: #f3f4f6; margin: 24px 0; }
          .btn { display: inline-block; padding: 14px 28px; background: #0891b2; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px; letter-spacing: -0.02em;">Flux Web Studio</h1>
            <p style="margin:8px 0 0; font-size: 14px; opacity: 0.7;">New Website Enquiry Received</p>
          </div>
          <div class="content">
            <div class="field-label">Full Name</div>
            <div class="field-value">${name}</div>
            
            <div class="field-label">Email Address</div>
            <div class="field-value">${email}</div>
            
            <div class="field-label">Subject</div>
            <div class="field-value">${subject}</div>

            <div class="divider"></div>

            <div class="field-label">Company</div>
            <div class="field-value">${company || 'N/A'}</div>

            <div class="field-label">Website</div>
            <div class="field-value">${website || 'N/A'}</div>

            <div class="field-label">Project Budget</div>
            <div class="field-value">${budget || 'N/A'}</div>

            <div class="divider"></div>

            <div class="field-label">Message</div>
            <div class="field-value" style="white-space: pre-wrap;">${message}</div>

            <div style="margin-top: 40px; text-align: center;">
              <a href="mailto:${email}" class="btn">Reply to Enquirer</a>
            </div>
          </div>
          <div class="footer">
            Submitted from &bull; fluxwebstudio.co.uk<br>
            ${timestamp} UTC<br><br>
            &copy; 2024 Flux Web Studio
          </div>
        </div>
      </body>
      </html>
    `.trim();

    // 4. Send Lead Email via Cloudflare Email Routing
    const messageId = `<${crypto.randomUUID()}@fluxwebstudio.com>`;
    const mime = [
      `Message-ID: ${messageId}`,
      `Date: ${new Date().toUTCString()}`,
      `From: "FWS Leads" <${senderAddr}>`,
      `To: ${internalRecipient}`,
      `Subject: New Website Enquiry — Flux Web Studio`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="utf-8"`,
      ``,
      htmlBody
    ].join("\r\n");

    const emailMsg = {
      from: senderAddr,
      to: internalRecipient,
      raw: mime
    };

    // Note: env.FWS_EMAIL must be bound in Cloudflare Pages dashboard
    await env.FWS_EMAIL.send(emailMsg);

    return new Response(JSON.stringify({ success: true, message: "Message sent successfully!" }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Worker Error:", err);
    return new Response(JSON.stringify({ success: false, error: "Failed to send message.", details: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
}
