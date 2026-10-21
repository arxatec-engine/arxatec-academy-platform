# Frontend decisions

This document records decisions observable in the current implementation. Decisions that change a contract must also be reviewed in `arxatec-academy-service`.

| Current decision                           | Rationale and consequence                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| React 19, strict TypeScript, and Vite      | Web SPA with build-time type checking.                                                                                                |
| `pnpm`                                     | Package manager pinned in `packageManager`; `pnpm-lock.yaml` is the project lockfile.                                                 |
| Centralized routes and lazy page loading   | Spanish paths; page code loads when its route opens.                                                                                  |
| Two Axios clients                          | One attaches the bearer token; the public client neither sends a session nor terminates one on public endpoint errors.                |
| React Query for remote data                | Shared cache and bounded refetching; UI state does not duplicate server results.                                                      |
| Token storage follows “remember me”        | `localStorage` retains remembered sessions; `sessionStorage` limits other sessions to the tab. Password credentials are never stored. |
| Three languages in frontend resources      | Spanish, English, and Portuguese retain equivalent key trees.                                                                         |
| Theme and language are browser preferences | Theme may follow the system; preferences are not synchronized to the server account.                                                  |
| Academy and administration share one SPA   | `/admin` tools require `ADMIN`; courses and learning remain in primary navigation.                                                    |
| `arxatec-ui` and sans typography           | Controls, the Academy logo, and tokens retain the shared visual system.                                                               |
| Public catalog and samples                 | Visitors can discover courses before registering; the API decides which lesson is locked.                                             |
| Public certificate URLs                    | The server issues and verifies certificates; `/certificados/:id` uses public Axios and links to the backend PDF with its QR code.     |

Changing an API contract, account access, or persistence requires reviewing `arxatec-academy-service` and the harness as well as this table.
