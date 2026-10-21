# Profile and account

`/perfil` requires a session. It presents personal details and completed-course totals. Profile updates accept only the name; organization/independent status and city are not editable through this form or the profile update API. Users can upload or remove an avatar. Password accounts can change passwords; Google accounts do not show that form as though they were password accounts.

Account deletion requests UI confirmation and may require a password where applicable. The mutation uses `DELETE /me`, then clears the user and remote cache. The API validates the request and applies its data and file effects.

Profile and avatar mutations update the session user from the backend response. Services, types, and validation details are documented in `src/modules/profile/features/profile/docs/README.md`.
