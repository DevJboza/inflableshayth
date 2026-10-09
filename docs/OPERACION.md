# Operación de Inflables Shayth Campaign Center

## Activación segura de la primera campaña

1. En **Escuelas**, confirme que cada destinatario sea una escuela primaria y cambie su autorización a **Autorizado** únicamente cuando exista una base válida para contactarla.
2. En **Configuración**, revise la cuenta remitente y el máximo total diario. Este límite reduce el riesgo, pero no garantiza que Gmail no aplique restricciones.
3. Cree la campaña con el asistente, seleccione público, horario y fecha, y revise la confirmación.
4. Use **Iniciar campaña** solo después de la autorización del cliente.
5. Abra la campaña para vigilar progreso, respuestas y problemas. Puede pausarla o cancelarla en cualquier momento.

## Seguridad y entregabilidad

- Los envíos solo se reclaman en días y horas permitidos, con zona `America/Costa_Rica`.
- El límite general se aplica entre todas las campañas; cada campaña también tiene su propio límite.
- Las bajas entran en la lista de exclusión y dejan de ser elegibles.
- Un trabajo interrumpido queda en revisión y no se reintenta a ciegas.
- Gmail puede no ser apropiado para campañas comerciales de gran volumen. Antes de aumentar límites, confirme las políticas y cuotas de la cuenta.
- SPF, DKIM y DMARC dependen del dominio remitente. La cuenta actual es Gmail y estas comprobaciones deben hacerse en la administración del dominio si se migra a correo propio.

## Credenciales pendientes de confirmar

El workflow utiliza credenciales distintas para enviar y leer respuestas. Antes de la primera campaña real, confirme dentro de n8n que ambas corresponden al buzón previsto. No se cambiaron automáticamente para evitar desconectar una cuenta válida.

## Recuperación

El respaldo previo al cambio está en `n8n/backups/shayth-unified-before-professionalization.json`. Las campañas y trabajos permanecen en PostgreSQL, por lo que reiniciar n8n no pierde el progreso.
