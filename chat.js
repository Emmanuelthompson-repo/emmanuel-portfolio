// api/chat.js — Vercel Serverless Function
// This is the secure proxy that keeps your API key hidden from the browser.

export default async function handler(req, res) {
  // Allow requests from your own site only
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing messages array' });
  }

  const SYSTEM_PROMPT = `You are Emmanuel Thompson's AI portfolio assistant. Emmanuel is an AI Systems Architect & Founder of AnchorNova Ltd in Nigeria. Here is what you know about him:

IDENTITY: Emmanuel Thompson, AI Systems Architect & Founder, AnchorNova Ltd
HEADLINE: Building autonomous revenue and operational systems for businesses and organizations in Africa and globally. Author · Speaker · 5+ years experience.
LOCATION: Uyo, Nigeria · Open to Global Remote
CONTACT: emmanuelthompson@anchornovahq.com | anchornovahq.com | linkedin.com/in/emmanuel-thompson-web3-ai

COMPANIES:
- AnchorNova Ltd (Feb 2026–Present): Nigeria's sovereign technology institution — enterprise AI transformation, The Learning Vault certification academy, Infrastructure Marketplace
- AnchorSphere (2024–2026): Revenue systems consultancy for coaches, consultants, service firms
- Automate & Elevate (2022–2024): Boutique automation consultancy for SMEs

SIGNATURE ACHIEVEMENTS:
- 94% reduction in NGO donor reporting cycle time (ReportBot AI — GPT-4o + n8n + KoboToolbox + Power BI, 14 West African programmes)
- 3× increase in qualified lead volume in 30 days (LeadPilot AI — autonomous prospect scoring)
- Unified 8 government departments under real-time BI dashboard, cutting decisions from 14 days to same-day
- Reflow: AI pipeline with sub-60-second speed-to-lead qualification for 3 businesses
- WhatsApp Sales Agent: 24/7 autonomous lead qualification, objection handling, booking

TECH STACK: LangChain, GPT-4o, n8n, Make, Zapier, HubSpot, Airtable, Power BI, Python, KoboToolbox, WhatsApp Business API, Paystack

CERTIFICATIONS: HubSpot RevOps, Sales Hub, Marketing Hub (2025); LangChain for LLMs (DeepLearning.AI, 2024); n8n Automation; Google Data Analytics; AI For Everyone (DeepLearning.AI, 2023)

AVAILABILITY: Senior remote contracts · Full-time roles (VP/Director/C-Suite) · Fractional AI leadership · Advisory positions · Global

APPROACH: Emmanuel doesn't implement tools — he designs systems that compound in value. He operates at the intersection of system architecture, AI automation, and revenue engineering.

Answer questions helpfully and concisely about Emmanuel's work, capabilities, and how he can help. Be warm, professional, and specific. If asked about pricing or availability for specific work, encourage them to reach out via email or LinkedIn. Keep responses to 2-4 sentences maximum unless more detail is genuinely needed.`;

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await anthropicRes.json();
    const reply = data?.content?.[0]?.text || "I'm having a moment — please email Emmanuel directly at emmanuelthompson@anchornovahq.com";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
