# Environment Variables Template

Copy these variables to your `.env.local` file and fill in your actual values:

```env
# Paychangu Inline Checkout (Client-side Public Key)
NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY=your_public_key_here
```

## Getting Your Paychangu Credentials

1. Sign up at https://paychangu.com
2. Navigate to Developer/API section in your dashboard
3. Copy your **Public Key** (starts with `pub-`)
4. Paste it as the value for `NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY`

## Test Card Numbers

- **Test Card**: 4242 4242 4242 4242
- **Test Airtel Money**: 990000000

## How It Works

The Inline Checkout uses a client-side public key to open a popup modal on your page. No server-side API calls are needed to initiate payments. The user completes payment in the popup, then gets redirected back to your callback URL.
