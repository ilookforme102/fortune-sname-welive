# CQ9 Game Service Integration

## Overview

This microservice integrates the CQ9 game provider into the Game Aggregator Platform using Seamless Wallet Mode.

## Deployment Instructions

1. Build Docker image:

   ```bash
   docker build -t svc-slot-cq9 .
   ```
2. Push to registry:

   ```bash
   docker push svc-slot-cq9
   ```
3. Deploy to Kubernetes:

   ```bash
   helm install svc-slot-cq9 ./helm
   ```

## Environment Variables

- `API_SYS_BASE_URL`: API SYS base URL
- `API_SYS_TOKEN`: Authentication token for API SYS
- `PORT`: Service port (default: 3000)

## Test Cases

- \[x\] Game session creation
- \[x\] Bet callback (debit)
- \[x\] Win callback (credit)
- \[x\] Rollback callback
- \[x\] Redirect URL generation

## Rollback Instructions

To rollback a wager:

1. Call `POST /callback/rollback` with `user_id` and `wager_no`.
2. Verify balance restoration via `GET /api/internal/v1/usr/wallet/balance`.

## Integration Notes

- Metadata includes `game_type: slot` and `round_id`.
- Retry logic uses exponential backoff for API SYS calls.