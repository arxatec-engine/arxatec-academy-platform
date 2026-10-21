# Notifications and topic proposals

The learning experience lets users leave an email for general or course-specific notifications and propose a topic they want to study. Forms open on demand in `arxatec-ui` dialogs. The API supports optional sessions: signed-in users use their account email; guests provide an email.

Services call `POST /notifications/signups` and `POST /notifications/topics`; the backend owns rate limiting and idempotency. A request does not imply that a course will be created or a notification has been sent.

At `/admin/avisos`, `ADMIN` can review requests, export signups, mark groups by a cutoff date, and delete a subscription. Marking recipients records an administrative action; the screen does not send bulk email.

See `src/modules/notifications/features/interest/docs/README.md` and `src/modules/admin/features/notifications/docs/README.md`.
