
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

    // 3. Dispatch to the dedicated Cloudflare Email Worker
    // Reusing the same architecture as the Flux Automate project
    const workerUrl = "https://fws-email-worker.eltechldn.workers.dev";
    
    const payload = {
      // 1. New Worker Contract (Explicit Branching)
      type: 'website_enquiry',
      fullName: name,
      email: email,
      companyName: company || 'N/A',
      website: website || 'N/A',
      budget: budget || 'N/A',
      subject: subject || 'General Enquiry',
      message: message,

      // 2. Legacy Worker Contract (Backwards Compatibility)
      // This ensures 200 OK even if the worker hasn't redeployed the 'type' support yet
      automationInterest: `Website Enquiry: ${subject}`,
      workflowDescription: message
    };

    console.log(`[API] Attempting worker dispatch to: ${workerUrl}`);
    console.log(`[API] Payload:`, JSON.stringify(payload));

    const workerResponse = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (workerResponse.ok) {
      const result = await workerResponse.json();
      if (result.success) {
        return new Response(JSON.stringify({ success: true, message: "Message sent successfully!" }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      } else {
        throw new Error(result.error || "Worker failed to dispatch email.");
      }
    } else {
      const errorText = await workerResponse.text();
      throw new Error(`Worker failed with status ${workerResponse.status}: ${errorText}`);
    }

  } catch (err) {
    console.error("Worker Error:", err);
    return new Response(JSON.stringify({ success: false, error: "Failed to send message.", details: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
}
