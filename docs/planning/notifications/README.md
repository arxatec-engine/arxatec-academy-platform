# Avisos y propuestas de temas

La experiencia educativa permite dejar email para recibir avisos generales o de un curso y proponer un tema que se desea estudiar. Los formularios se abren bajo demanda en diálogos de `arxatec-ui`. El API admite sesión opcional: con cuenta toma el correo de la cuenta; sin cuenta, solicita correo.

Los servicios usan `POST /notifications/signups` y `POST /notifications/topics`; limitación de frecuencia e idempotencia se aplican en el backend. Las solicitudes no implican que el curso vaya a crearse ni que se haya enviado un aviso.

En `/admin/avisos`, rol `ADMIN` puede revisar solicitudes, exportar altas, marcar grupos según una fecha de corte y borrar una suscripción. Marcar destinatarios registra una acción administrativa; la pantalla no envía correos en masa.

Más detalle en `src/modules/notifications/features/interest/docs/README.md` y `src/modules/admin/features/notifications/docs/README.md`.
