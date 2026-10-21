# Arxatec Academy documentation

Arxatec Academy is a learning platform for its students. This documentation describes the code in this repository: the public catalog, courses and lessons, progress, comments, profiles, and tools available to administrators. Accounts and learning are the core of the product.

| Document                                       | Contents                                                   |
| ---------------------------------------------- | ---------------------------------------------------------- |
| [Architecture](ARCHITECTURE.md)                | Frontend organization, navigation, sessions, and data.     |
| [Code style](CODE_STYLING.md)                  | Conventions for new changes.                               |
| [Decisions](DECISIONS.md)                      | Current frontend decisions.                                |
| [Environment](ENV.md)                          | Public configuration and local startup.                    |
| [Deployment](DEPLOYMENT.md)                    | Builds and static hosting requirements.                    |
| [Performance](PERFORMANCE.md)                  | Route loading, images, and caching.                        |
| [Testing](TESTING.md)                          | Available commands and coverage present in the repository. |
| [Internationalization](I18N.md)                | Spanish, English, and Portuguese.                          |
| [Product and module plans](planning/README.md) | Academy's current scope and next considerations.           |
| [Shipped changes](shipped/README.md)           | Change history for this repository.                        |

Verifiable implementation lives in `src/` and `package.json`. Feature documents under `src/modules/**/docs/README.md` explain specific behavior and evolve with their code. Specifications describe scope; compare current behavior against `src/` and the service contracts.

This project includes course administration, moderation, a student directory, and notification tools restricted by role. These tools support the Academy experience; they do not turn the product into an enterprise management dashboard.
