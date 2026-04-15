# Environment Variables Template

Copy these variables to your `.env.local` file and fill in your actual values:

```env
# Paychangu Payment Integration
PAYCHANGU_SECRET_KEY=your_secret_key_here

# Optional: Enable simulation mode for testing (no real API calls)
PAYMENT_SIMULATION=true
```

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
