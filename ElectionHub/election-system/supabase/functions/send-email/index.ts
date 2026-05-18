import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const resendApiKey = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const { email, secretId, electionTitle } = await req.json()

    if (!email || !secretId || !electionTitle) {
      return new Response('Missing required parameters', { status: 400 })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'SecureVote Pro <voting@securevote.pro>',
        to: [email],
        subject: `Your Secret Voter ID for ${electionTitle}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h2>Your Voter Registration is Confirmed!</h2>
            <p>You have successfully registered for <strong>${electionTitle}</strong>.</p>
            <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
              <p style="margin: 0; color: #52525b; font-size: 14px;">Your Secret Voter ID:</p>
              <h1 style="margin: 8px 0 0; color: #18181b; letter-spacing: 2px;">${secretId}</h1>
            </div>
            <p style="color: #dc2626; font-size: 14px;"><strong>Important:</strong> Do not share this ID with anyone. This is your only key to cast your vote securely and anonymously.</p>
          </div>
        `
      })
    })

    if (!res.ok) {
      throw new Error(`Resend API returned ${res.status}`)
    }

    const data = await res.json()
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
