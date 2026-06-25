# Deploy Mesmer Firebase Cloud Functions
# Prerequisites: firebase login, Stripe secrets set (see below)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Project: mesmer-db584" -ForegroundColor Cyan
Write-Host ""
Write-Host "Before first deploy, run once:" -ForegroundColor Yellow
Write-Host "  firebase login"
Write-Host "  firebase functions:secrets:set STRIPE_SECRET_KEY"
Write-Host "  firebase functions:secrets:set STRIPE_WEBHOOK_SECRET"
Write-Host ""
Write-Host "Then add Stripe webhook URL in Dashboard:" -ForegroundColor Yellow
Write-Host "  https://europe-west1-mesmer-db584.cloudfunctions.net/stripeSubscriptionWebhook"
Write-Host ""

firebase deploy --only functions:stripeSubscriptionWebhook,functions:subscriptionHealth
