# Environment Variables Template

Copy these variables to your `.env.local` file and fill in your actual values:

```env
# Google Gemini AI (for RAG embeddings)
GEMINI_API_KEY=your_gemini_api_key_here

# Paychangu Payment Integration
PAYCHANGU_SECRET_KEY=your_secret_key_here

# Optional: Enable simulation mode for testing (no real API calls)
PAYMENT_SIMULATION=true
```

## Getting Your Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it as the value for `GEMINI_API_KEY`

The Gemini free tier includes:
- 15 requests per minute for embedding models
- No ongoing costs for MVP usage
- Perfect for property search with semantic understanding

## Getting Your Paychangu Credentials

1. Sign up at https://paychangu.com
2. Navigate to Developer/API section in your dashboard
3. Copy your Secret Key
4. Paste it as the value for `PAYCHANGU_SECRET_KEY`

## Simulation Mode

When `PAYMENT_SIMULATION=true`, the payment flow will be simulated without making real API calls. This is useful for:
- Development without live credentials
- Testing the UI flow
- CI/CD pipelines

Remove or set to `false` to use live Paychangu API.
