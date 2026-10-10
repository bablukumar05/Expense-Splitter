# Expense Splitter API

Phase 1 provides the Express/Mongoose foundation and account authentication. All money-related functionality is intentionally deferred to later phases; monetary values in future APIs must be represented as integer paise.

## Requirements

- Node.js 20 or newer
- MongoDB Atlas (or a compatible MongoDB deployment)
- SMTP credentials for password-reset email delivery

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env` and set `MONGO_URI`, a random `JWT_ACCESS_SECRET` of at least 32 characters, and SMTP settings.
3. Run `npm run dev`.
4. The API listens on `http://localhost:5000` by default. `GET /api/health` reports whether MongoDB is connected.

Never commit `.env`. The API returns access and refresh tokens in JSON; clients should keep refresh tokens in secure platform storage and send them only over HTTPS outside local development.

## Response format

Successful responses use `{ "success": true, "message": "...", "data": ... }`. Errors use `{ "success": false, "message": "...", "data": null }`; validation errors include field details in `data`.

## Phase 1 routes

All request bodies are JSON. Send `Content-Type: application/json`.

| Method | Path | Authentication | Request |
| --- | --- | --- | --- |
| GET | `/api/health` | No | No body |
| POST | `/api/auth/register` | No | `{ "name": "Asha Rao", "email": "asha@example.com", "password": "StrongPass123" }` |
| POST | `/api/auth/login` | No | `{ "email": "asha@example.com", "password": "StrongPass123" }` |
| POST | `/api/auth/refresh-token` | No | `{ "refreshToken": "<refresh token>" }` |
| POST | `/api/auth/logout` | No | `{ "refreshToken": "<refresh token>" }` |
| GET | `/api/auth/me` | Bearer access token | No body |
| PATCH | `/api/users/me` | Bearer access token | Any of `{ "name": "Asha R.", "avatar": "https://example.com/avatar.png", "defaultCurrency": "INR" }` |
| PATCH | `/api/users/change-password` | Bearer access token | `{ "currentPassword": "StrongPass123", "newPassword": "AnotherPass456" }` |
| POST | `/api/auth/forgot-password` | No | `{ "email": "asha@example.com" }` |
| POST | `/api/auth/reset-password` | No | `{ "token": "<token from reset email>", "password": "NewStrongPass123" }` |

Registration and login return `{ user, accessToken, refreshToken }`. Access tokens expire after 15 minutes by default. Refresh tokens are random opaque values, expire after 7 days, and only their SHA-256 hashes are persisted. Refresh rotates the token, invalidating the previous value. Password changes and resets revoke all refresh tokens and invalidate existing access tokens.

## Postman checks

Set a Postman environment variable `baseUrl` to `http://localhost:5000`.

1. `GET {{baseUrl}}/api/health` should return HTTP 200 and `data.database` set to `connected` after MongoDB connects.
2. `POST {{baseUrl}}/api/auth/register` with the registration body above should return HTTP 201. Save `data.accessToken` and `data.refreshToken` from the response.
3. `GET {{baseUrl}}/api/auth/me` with `Authorization: Bearer <accessToken>` should return the current user without password or refresh-token data.
4. `PATCH {{baseUrl}}/api/users/me` with that bearer token and `{ "defaultCurrency": "USD" }` should return the changed profile.
5. `POST {{baseUrl}}/api/auth/refresh-token` with the saved refresh token should return a new token pair. Reusing the old refresh token should return HTTP 401.
6. `PATCH {{baseUrl}}/api/users/change-password` with bearer auth and current/new passwords should return HTTP 200. The old access token and refresh token should then both return HTTP 401.
7. Log in using the new password, then `POST {{baseUrl}}/api/auth/logout` with its refresh token. A subsequent refresh with that token should return HTTP 401.
8. `POST {{baseUrl}}/api/auth/forgot-password` with a registered email should return a generic success message and send a reset link to that account. Complete `POST {{baseUrl}}/api/auth/reset-password` with the token from the email and a new password, then verify login with the new password.
9. Send an invalid email or a password shorter than 8 characters to registration; expect HTTP 400 with validation details. Duplicate registration should return HTTP 409.

Run the unit tests with `npm test`. The API has no Phase 1 dependency on MongoDB for these unit tests.

## Phase 2: Groups and invites

Phase 2 adds group creation, member management, placeholders, roles, invite links, and invite joins. All authenticated endpoints require `Authorization: Bearer <accessToken>`. Group responses have the standard response envelope; most single-group operations return the group at `data.group`.

### Routes

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/groups` | Signed in | Create a group with a type/emoji; creator is its first admin |
| GET | `/api/groups?page=1&limit=10&search=goa` | Signed in | List active memberships with pagination and optional name search |
| GET | `/api/groups/:groupId` | Active group member | Get group and active members |
| PATCH | `/api/groups/:groupId` | Group admin | Update group name, description, type, or emoji |
| DELETE | `/api/groups/:groupId` | Group admin | Archive the group |
| POST | `/api/groups/:groupId/restore` | Active group admin | Restore an archived group within 30 days |
| POST | `/api/groups/:groupId/invitations` | Group admin | Email the group invite link to an address |
| POST | `/api/groups/:groupId/placeholders` | Group admin | Add a member without an account |
| DELETE | `/api/groups/:groupId/members/:memberId?block=true` | Group admin | Soft-remove and optionally block a member from rejoining |
| POST | `/api/groups/:groupId/members/:memberId/unblock` | Group admin | Allow a blocked member to rejoin |
| PATCH | `/api/groups/:groupId/members/:memberId/role` | Group admin | Set a real member's role to `admin` or `member` |
| POST | `/api/groups/:groupId/leave` | Active group member | Leave the group |
| POST | `/api/groups/:groupId/placeholders/:placeholderId/merge` | Group admin | Merge a placeholder into an active registered member transactionally |
| GET | `/api/groups/:groupId/invite` | Group admin | Get the group's invite link and settings |
| POST | `/api/groups/:groupId/invite/regenerate` | Group admin | Rotate the invite code and reset its use count |
| PATCH | `/api/groups/:groupId/invite` | Group admin | Change invite active state, expiry, or use limit |
| DELETE | `/api/groups/:groupId/invite` | Group admin | Revoke the invite |
| GET | `/api/invite/:inviteCode` | Public | Preview only the group name and active member count |
| POST | `/api/invite/:inviteCode/join` | Signed in | Join or reactivate membership using the invite |

Example bodies:

```json
POST /api/groups
{ "name": "Goa Trip", "description": "Dec 2026", "currency": "INR", "type": "trip", "emoji": "🏝️" }
```

```json
POST /api/groups/:groupId/invitations
{ "email": "b@test.com" }
```

```json
POST /api/groups/:groupId/placeholders
{ "name": "Rahul" }
```

```json
PATCH /api/groups/:groupId/invite
{ "expiresAt": "2030-01-01T00:00:00Z", "maxUses": null }
```

Every member entry has its own MongoDB `_id`; Phase 3 expenses must reference that member ID, not `user._id`. Placeholder entries have `user: null`. Removal and leaving set `isActive: false` and `leftAt`, preserving the entry for expense history. An admin can additionally set `?block=true`; blocked members cannot rejoin until an admin unblocks them. Group responses include only active members, while normal group JSON never includes the invite code. Group `type` is one of `trip`, `home`, `couple`, `friends`, or `other`; `emoji` is optional and defaults to `💸`.

Invite codes contain 128 random bits. Public invite preview and join routes share a limit of 30 requests per 15 minutes per client IP. Preview deliberately returns no member identities or other group details. The join update atomically checks invite state, expiry, max uses, and the 50-member cap before incrementing usage and adding/reactivating a member. Admin email invitations do not look up recipient accounts and return the same success message for registered and unregistered email addresses. Non-members receive 404 when requesting a group to avoid disclosing its existence.

Limits are 50 active members per group and 100 active groups per account. Only admins can merge a placeholder into an active registered member; the target member ID is explicit, and the expense-history merge plus placeholder deactivation run in a MongoDB transaction. The balance service still returns zero for all members and no unsettled groups; replace these balance stubs with expense and settlement calculations in Phase 4. MongoDB transactions require Atlas or another replica-set/sharded deployment; a standalone local `mongod` cannot run the merge endpoint successfully. Archived groups can be restored by an active group admin for 30 days after archival.

### Postman verification

Set `baseUrl` to `http://localhost:5000`. Register accounts A, B, C, and D and save their access tokens as `tokenA`, `tokenB`, `tokenC`, and `tokenD`. Send JSON bodies with `Content-Type: application/json`; use `Authorization: Bearer {{tokenA}}` (or the matching account token). Save `data.group._id` as `groupId`, member entry `_id` values as `aMemberId`, `bMemberId`, etc., and the invite code from the admin invite response as `inviteCode`.

| # | Request | Expected |
| --- | --- | --- |
| 1 | A: `POST /api/groups` with `{ "name": "Goa Trip", "description": "Dec 2026", "type": "trip", "emoji": "🏝️" }` | 201; A is admin, type/emoji are returned, and A has a member `_id` |
| 2 | A: `GET /api/groups?page=1&limit=10&search=goa` | 200; matching group and pagination returned; active member count is 1 |
| 3 | A: `GET /api/groups/:groupId` | 200; active members are populated with account profile fields |
| 4 | D: `GET /api/groups/:groupId` | 404; non-member cannot discover the group |
| 5 | A: `PATCH /api/groups/:groupId` with `{ "name": "Goa Trip 2026", "type": "friends", "emoji": "🎉" }` | 200; changed metadata returned |
| 6 | A: `POST /api/groups/:groupId/invitations` with B's registered email | 200 generic response; email contains the join link, B is not yet a member |
| 7 | A: repeat invitations with an unregistered but syntactically valid email | Same HTTP status/message as step 6; no account lookup is performed |
| 8 | A: `GET /api/groups/:groupId/invite` | 200; save invite code from the link; normal group JSON still omits it |
| 9 | B: `POST /api/invite/:inviteCode/join` | 200; B joins and receives a distinct member `_id` |
| 10 | B: try `POST /api/groups/:groupId/placeholders` | 403; B is not an admin yet |
| 11 | A: add placeholder Rahul with `POST /api/groups/:groupId/placeholders` | 201; `user` is null and placeholder has its own `_id` |
| 12 | A: promote B using `PATCH /api/groups/:groupId/members/:memberId/role` with `{ "role": "admin" }` | 200; B becomes admin |
| 13 | A: demote A with the same route and `{ "role": "member" }` | 200; B remains admin |
| 14 | B: try to demote B to `member` while B is the only admin | 400; a group must retain an admin |
| 15 | B: `GET /api/groups/:groupId/invite` | 200; link/settings returned |
| 16 | No token: `GET /api/invite/:inviteCode` | 200; only group name and active member count returned |
| 17 | C: `POST /api/invite/:inviteCode/join` | 200; C joins with a group-member ID |
| 18 | C: repeat the invite join | 409; already an active member |
| 19 | B: set invite `maxUses` to 1, then D joins | Settings return 200; D receives 410 because uses are exhausted |
| 20 | B: set `expiresAt` to a future date and `maxUses` to null | 200; invite remains usable until its expiry |
| 21 | B: regenerate invite, then preview the previous code | 200 for regeneration; previous code returns 404 |
| 22 | B: revoke the new code, preview it, then reactivate through invite settings | Preview returns 404 while revoked; settings can reactivate it |
| 23 | C: `POST /api/groups/:groupId/leave` | 200; C's membership becomes inactive |
| 24 | C: join again through the active invite | 200; original member entry is reactivated rather than duplicated |
| 25 | B: `DELETE /api/groups/:groupId/members/:memberId?block=true` for C | 200; C becomes inactive and blocked |
| 26 | C tries joining (403); B unblocks with `POST /api/groups/:groupId/members/:memberId/unblock`; C joins again (200) | Block prevents rejoin until admin unblocks; same member `_id` is reused |

Additional hardening checks:

| Check | Request | Expected |
| --- | --- | --- |
| Placeholder merge authorization | B: `POST /api/groups/:groupId/placeholders/:placeholderId/merge` with `{ "memberId": "<bMemberId>" }`; repeat as non-admin A | Admin receives 200 on Atlas/replica set; A receives 403; placeholder is inactive and `mergedInto` is B's member ID |
| Invite throttling | Send `GET /api/invite/short` 31 times from the same IP within 15 minutes | First 30 get validation errors; request 31 gets 429 before route handling |
| Archive and restore | B archives with `DELETE /api/groups/:groupId`, then restores with `POST /api/groups/:groupId/restore` | Archive and restore return 200; restored group can be fetched again |
| Group type and emoji | `POST /api/groups` with `{ "name": "Flat", "type": "home", "emoji": "🏠" }` | 201; response contains `type: "home"` and `emoji: "🏠"` |

Also check validation with an invalid ObjectId, invalid role, empty update body, expired invite date, `page=0`, and `block=yes`; each returns HTTP 400 with field details. The Phase 2 unit suite runs with `npm test` and does not need MongoDB. Full Postman flows require a running database; placeholder merge requires Atlas or another replica-set/sharded deployment, and email invitation checks require SMTP settings.

## Phase 3: Expenses

All expense references use the embedded group-member `_id`, never the account's `user._id`, so placeholders can be payers and participants. API monetary inputs and JSON responses are rupees with at most two decimal places. MongoDB stores every amount as an integer number of paise (for example, ₹100.50 is `10050`). Split rounding uses the deterministic largest-remainder method so payer/split sums exactly equal the expense total. Group currency is applied to the expense; currency conversion is not part of Phase 3.

### Routes

All routes require a signed-in active group member, except that reading/updating/deleting a particular expense first returns 404 unless it is visible through an active membership. For update, delete, and receipt operations, the expense creator or a group admin is required.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/groups/:groupId/expenses` | Active group member | Create expense with one or more payers and one of four split types |
| GET | `/api/groups/:groupId/expenses` | Active group member | Search/filter/sort/paginate expenses and return filtered total |
| GET | `/api/expenses/:expenseId` | Active member of its group | Fetch a non-deleted expense |
| PATCH | `/api/expenses/:expenseId` | Creator or group admin | Update expense details; all four financial fields change together |
| DELETE | `/api/expenses/:expenseId` | Creator or group admin | Soft-delete the expense |
| POST | `/api/expenses/:expenseId/receipt` | Creator or group admin | Upload a receipt image as multipart form-data field `receipt` |
| DELETE | `/api/expenses/:expenseId/receipt` | Creator or group admin | Remove receipt metadata and Cloudinary image |

Split types are `EQUAL`, `EXACT`, `PERCENTAGE`, and `SHARES`. `paidBy` accepts up to 20 `{ member, amount }` entries. `splits` accepts up to 50 `{ member, amount? , percentage?, shares? }` entries, with amounts in rupees. For `EXACT`, split `amount` values must equal the total. For `PERCENTAGE`, percentages must sum to exactly 100 using integer basis points. For `SHARES`, every participant must have a positive whole-number share count. For `EQUAL`, split entries only need their member IDs.

Example request:

```json
POST /api/groups/:groupId/expenses
{
	"description": "Dinner",
	"amount": 100,
	"splitType": "EQUAL",
	"paidBy": [{ "member": "<aMemberId>", "amount": 100 }],
	"splits": [
		{ "member": "<aMemberId>" },
		{ "member": "<bMemberId>" },
		{ "member": "<cMemberId>" }
	]
}
```

The response gives owed shares ₹33.34, ₹33.33, and ₹33.33; their sum is exactly ₹100. Expense JSON converts stored paise back to rupees, while `toObject()` and database records keep integer paise. Model validation independently checks that payer amounts and owed amounts each sum exactly to the stored total. Financial edits must include `amount`, `paidBy`, `splitType`, and `splits` together; detail-only edits may update description, category, date, or notes. Deleted expenses remain stored with `isDeleted`, `deletedAt`, and `deletedBy` and are omitted from normal list/get operations.

The expense list supports `page`, `limit`, `search`, `category`, `from`, `to`, `paidBy`, `member`, `sortBy` (`date`, `amount`, or `createdAt`), and `order` (`asc` or `desc`). `summary.totalAmount` is the sum after the same filters, converted back to rupees. Payer and split member values in expense responses remain member IDs; resolve names from `GET /api/groups/:groupId` on the client.

Receipts use Multer memory storage and are limited to one JPG/JPEG, PNG, or WEBP image up to 5 MiB. Authorization is checked before the upload middleware runs. Cloudinary is optional for non-receipt API use; receipt endpoints return 503 until all three `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` variables are configured. Uploaded images are resized to at most 1600×1600 and optimized; the internal Cloudinary public ID is never serialized. Replacing a receipt saves the new upload before attempting to remove the previous one.

Phase 3 also replaces the Phase 2 placeholder-history stub: when an admin merges a placeholder into an active registered member, expense payer/split references are remapped inside the same MongoDB transaction. If the target already appears in an expense, duplicate entries collapse and their integer amounts are added. Settlement history remains for Phase 5. The merge endpoint requires Atlas or another replica-set/sharded MongoDB deployment.

### Postman verification

Use the Phase 2 group and three active members A, B, and C. Get their **group member IDs** from `GET /api/groups/:groupId`; do not use account IDs. Configure Cloudinary variables for receipt upload checks. All amounts below are rupees at the API boundary.

| # | Request | Expected |
| --- | --- | --- |
| 1 | A: create ₹100 EQUAL expense; A pays ₹100; A/B/C split | 201; owed amounts ₹33.34, ₹33.33, ₹33.33 |
| 2 | A: create ₹30 EXACT expense; splits A ₹15, B ₹9, C ₹6 | 201; stored amount is 3000 paise |
| 3 | A: same EXACT request but C pays/split owes ₹5 | 400; exact split differs from total |
| 4 | A: create ₹999.99 PERCENTAGE expense; A/B/C percentages 50/30/20 | 201; owed shares sum to ₹999.99 |
| 5 | A: percentage values 50/30/10 | 400; percentages must add to 100 |
| 6 | A: create ₹100 SHARES expense; shares 1:2 | 201; owed amounts ₹33.33 and ₹66.67 |
| 7 | A/B are multiple payers contributing ₹6/₹4 to a ₹10 EQUAL expense | 201; total payer contribution equals total |
| 8 | Payers contribute only ₹9 to a ₹10 expense | 400; payer amounts do not equal total |
| 9 | Use a random/non-group member ID in `splits` | 400; member is not active in this group |
| 10 | Repeat one member in `splits` | 400; duplicate member rejected |
| 11 | Set amount to `10.123` | 400; maximum two decimal places |
| 12 | Request group expense list without token, then as a non-member | 401; then 404 |
| 13 | B: `GET /api/groups/:groupId/expenses` | 200; list, filtered total summary, and pagination |
| 14 | Filter list with `?search=din&category=food&sortBy=amount&order=asc` | 200; matching results sorted ascending by amount |
| 15 | Filter list with `?from=2026-10-01&to=2026-10-10` | 200; dates in the inclusive UTC range |
| 16 | Filter with `?paidBy=<aMemberId>` and separately `?member=<cMemberId>` | 200; only matching expense records |
| 17 | B: `GET /api/expenses/:expenseId` | 200; rupee amounts and member IDs returned |
| 18 | Creator A: patch only `{ "description": "Dinner at Taj" }` | 200; financial values unchanged |
| 19 | A: patch only `{ "amount": 200 }` | 400; all financial fields must be sent together |
| 20 | A: patch amount/payers/split type/splits as one complete set | 200; totals recalculate and remain exact |
| 21 | Non-admin B edits A's expense; then an admin tries the same edit | 403 for B; 200 for admin |
| 22 | A: `DELETE /api/expenses/:expenseId`, then fetch/list it | 200; subsequent GET is 404 and list omits it |
| 23 | A: multipart `POST /api/expenses/:expenseId/receipt`, field `receipt`, JPG | 200 with receipt URL |
| 24 | Upload PDF, then upload an image larger than 5 MiB | Both return 400 |
| 25 | Clear Cloudinary env settings and upload a receipt | 503; other expense endpoints remain available |
| 26 | A: `DELETE /api/expenses/:expenseId/receipt` | 200; receipt URL is empty |
| 27 | In Compass inspect an expense created for ₹1000.50 | Stored `amount` is integer `100050`; API returns `1000.5` |

Placeholder merge verification: create an expense where a placeholder is payer/split participant, then call `POST /api/groups/:groupId/placeholders/:placeholderId/merge` as admin with `{ "memberId": "<targetMemberId>" }`. Check that all expense references now point to the target member and any duplicate target/placeholder rows were collapsed. A non-admin call must return 403. Transaction-backed tests require Atlas/replica-set MongoDB; live receipt upload requires valid Cloudinary credentials.

The three requested largest-remainder examples were run and their outputs are covered by `src/tests/splitCalculator.test.js`: `[3334, 3333, 3333]`, `[3333, 6667]`, and `[49999, 30000, 20000]`. Unit coverage runs using `npm test` without MongoDB or Cloudinary.