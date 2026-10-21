# Verifying the Academy journey

Use this checklist for changes affecting the learning product. The existence of a test or route does not establish remote API availability.

1. Open the catalog as a guest; search text and change topic/level. Copy the URL and verify that returning retains the state.
2. Open course details and review the syllabus, fallback cover, and start action. When signed in, verify enrollment before lesson navigation.
3. Open a public sample and a locked lesson; check the return destination after registration or sign-in.
4. With an account, mark a lesson and review My courses. Also test an empty list and API error.
5. Check comments as a guest, with an unverified account, and with a verified account. The backend determines final permission.
6. Edit Profile, photo, and password as supported by the sign-in provider; check account deletion confirmation only in a safe environment.
7. As ADMIN, open affected administration routes. Verify the backend denies the same operation to a student account.
8. Review loading, error, and empty states, es/en/pt, light/dark themes, keyboard navigation, and a mobile viewport.

Record release results in `docs/shipped/` after verifying the change. Do not claim visual review or a backend call when only unit tests were executed.
