import "@testing-library/jest-dom"

process.env.DATABASE_URL ??= "postgresql://user:password@localhost:5432/teamfinder"
process.env.CLERK_SECRET_KEY ??= "sk_test_mock"
process.env.CLERK_WEBHOOK_SECRET ??= "whsec_mock"
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??= "pk_test_mock"
process.env.NEXT_PUBLIC_MAPBOX_TOKEN ??= "pk.mock"
process.env.RESEND_API_KEY ??= "re_mock"
