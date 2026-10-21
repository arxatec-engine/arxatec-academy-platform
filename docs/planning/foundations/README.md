# Product foundations

## Audience

Academy provides free legal tech education, particularly for legal professionals in Peru. The journey starts at the public catalog, where visitors can discover and open courses before creating an account. Accounts support enrollment, progress, My courses, and commenting after email verification.

The platform combines a learning space with administration tools. `/admin` pages organize courses and lessons, moderate discussions, provide a student directory, and manage notification requests. They are unavailable to `STUDENT` accounts and do not define primary student navigation.

## Frontend responsibilities

- Present Academy service responses through typed contracts and loading, error, and empty states.
- Guide guest access, registration, and return navigation to requested content.
- Send progress and profile changes to the authenticated API and reflect confirmed responses.
- Translate the entire interface into Spanish, English, and Portuguese.
- Respect roles and present available actions. The backend also enforces authorization and business rules.

The client is not the source of truth for permissions, enrollment, publication, moderation, or email verification. Hiding a link or guarding a route does not replace service authorization.

## Sources

- Actual screens and modules: `src/routes`, `src/modules`, and feature documentation.
- Service contracts: sibling repository `arxatec-academy-service`.
- Startup variables: [Environment](../../ENV.md), `.infisical.yaml`, and `src/config/env`.

A documented capability that the code does not implement must be identified as pending.
