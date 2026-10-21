# 🚀 POS to Google Sheets Integration via n8n Middleware

Sistema de integración y automatización backend middleware diseñado para procesar en tiempo real transacciones emitidas desde un Punto de Venta (POS) o cliente API hacia una base de datos operativa centralizada.

---

## 📌 Resumen del Proyecto

Este proyecto implementa un flujo de trabajo asincrónico event-driven que permite a sistemas de Punto de Venta (POS) o herramientas de prueba de APIs enviar tickets de venta en formato JSON. Las peticiones son recibidas por un webhook de **n8n**, transformadas y registradas automáticamente en una planilla de **Google Sheets** (`ERP_Simulado_DB`).

```text
┌──────────────────────────────┐
│   Simulador POS / Postman    │
└──────────────┬───────────────┘
               │ (HTTP POST / Payload JSON)
               ▼
┌──────────────────────────────┐
│   n8n Automation Engine      │
└──────────────┬───────────────┘
               │ (Google Sheets Integration / Append Row)
               ▼
┌──────────────────────────────┐
│  Google Sheets (Database)    │
└──────────────────────────────┘

estructura del repositorio
.
├── assets/
│   └── architecture.png                     # Diagrama de arquitectura del sistema
├── n8n/
│   └── sales_ingestion_workflow.json        # Flujo exportado de n8n listo para importar
├── postman/
│   ├── POS_Simulation.postman_collection.json # Colección de peticiones HTTP para Postman
│   └── sample_payload.json                   # Ejemplo de cuerpo de mensaje en formato JSON
├── .gitignore                                # Archivos ignorados por Git
└── README.md                                 # Documentación técnica del proyecto

🛠️ Tecnologías Utilizadas
Simulador POS / Cliente API: Postman.

Motor de Automatización & Middleware: n8n.

Base de Datos Operativa: Google Sheets API (ERP_Simulado_DB).

Formato de Intercambio: JSON / HTTP REST (POST).

🔄 Flujo de Datos
Emisión del Ticket: Postman envía una petición POST al endpoint Webhook de n8n simulando un ticket de venta gastronómico/retail.

Recepción y Validación: n8n escucha la solicitud, valida la estructura del payload JSON y mapea los parámetros (producto, cantidad, monto, sucursal, timestamp).

Persistencia de Datos: n8n ejecuta la operación Append Row dentro de la pestaña transacciones en Google Sheets.

Confirmación: El Webhook responde con un código de estado 200 OK confirmando el registro exitoso de la operación.

📋 Estructura del Payload JSON
Ejemplo de petición enviada desde Postman hacia el Webhook de n8n (postman/sample_payload.json):

JSON
{
  "id_transaccion": "TX-10928",
  "timestamp": "2026-10-21T14:30:00Z",
  "sucursal": "Centro",
  "producto": "Pizza Muzzarella",
  "cantidad": 2,
  "precio_unitario": 9000,
  "monto_total": 18000,
  "metodo_pago": "Mercado Pago"
}
🚀 Guía de Instalación y Uso
1. Clonar el Repositorio
Bash
git clone [https://github.com/silve-es/nombre-del-repo.git](https://github.com/silve-es/nombre-del-repo.git)
cd nombre-del-repo
2. Configurar el Workflow en n8n
Abre tu instancia de n8n.

Crea un nuevo flujo (New Workflow) e importa el archivo n8n/sales_ingestion_workflow.json.

Vincula las credenciales de tu cuenta de Google Sheets.

Activa el flujo y copia la Test URL o Production URL del nodo Webhook.

3. Ejecutar la Simulación desde Postman
Importa el archivo postman/POS_Simulation.postman_collection.json en Postman.

Actualiza la variable de entorno/URL del request con la dirección de tu Webhook en n8n.

Envía una petición POST y verifica que la nueva fila se registre automáticamente en tu planilla de Google Sheets.