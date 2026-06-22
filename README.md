# Gym Admin

Gym Admin es un sistema web pensado para ayudar a administrar un gimnasio de forma simple y ordenada.

La idea principal es centralizar en un solo lugar la informacion diaria del negocio: socios, planes, pagos, estados de deuda y acciones administrativas. El objetivo es que la persona que gestiona el gimnasio pueda ver rapido que esta pasando y tomar decisiones sin depender de planillas sueltas, anotaciones manuales o informacion repartida en distintos lugares.

## Que se hizo

Se construyo un panel administrativo para gestionar la operacion basica de un gimnasio.

El sistema permite registrar administradores, iniciar sesion y trabajar dentro de un dashboard privado. Desde ese dashboard se pueden cargar socios, registrar pagos, consultar planes, cambiar planes de socios y aplicar reglas mensuales para mantener actualizados los estados de pago.

Tambien se agrego una capa administrativa para guardar eventos importantes y alertas. Esto ayuda a entender que paso con cada socio y a no perder de vista situaciones que requieren seguimiento.

## Para que sirve

Este sistema sirve para reemplazar controles manuales o planillas simples por una herramienta mas clara y centralizada.

Ayuda a responder preguntas como:

- Quienes son los socios activos.
- Que socios tienen pagos pendientes.
- Que socios estan atrasados.
- Que pagos se registraron.
- Cuanto ingreso se cargo en el sistema.
- Que plan tiene cada socio.
- Cuando se cambio el plan de un socio.
- Que acciones administrativas ocurrieron.

## Funcionalidades principales

### Gestion de usuarios

El sistema cuenta con registro e inicio de sesion para administradores.

Esto permite que el panel no quede abierto al publico y que las acciones importantes queden asociadas a un usuario administrador.

### Dashboard operativo

El dashboard esta dividido por areas para que la informacion sea mas facil de leer:

- Socios
- Pagos
- Planes

Cada seccion muestra informacion distinta segun la tarea que se quiera realizar.

### Gestion de socios

Desde la seccion de socios se puede:

- Crear un nuevo socio.
- Registrar nombre, apellido, DNI, fecha de ingreso y plan.
- Ver el listado de socios cargados.
- Consultar el estado del socio.
- Consultar si el pago esta al dia, pendiente o atrasado.
- Desactivar socios cuando ya no corresponda mantenerlos activos.

Esto permite tener una base ordenada de personas que entrenan en el gimnasio.

### Gestion de planes

El sistema permite trabajar con planes de entrenamiento o membresia.

Cada plan tiene:

- Nombre.
- Cantidad de dias por semana.
- Precio.

Tambien se puede cambiar el plan asignado a un socio. Cuando se hace un cambio, el sistema guarda el historial para saber que plan tenia antes y desde cuando usa el nuevo.

### Gestion de pagos

Desde la seccion de pagos se puede registrar un pago realizado por un socio.

Cada pago puede incluir:

- Socio.
- Monto.
- Metodo de pago.
- Comprobante.
- Observaciones.

Cuando se registra un pago, el sistema actualiza el estado del socio para marcarlo como pagado.

### Reglas mensuales

Se agregaron acciones para actualizar estados de pago en bloque.

Esto sirve para tareas administrativas frecuentes, por ejemplo:

- Marcar socios activos como pendientes al inicio de un nuevo periodo.
- Marcar como atrasados a quienes siguen pendientes despues de cierto tiempo.

Estas acciones ayudan a mantener el dashboard actualizado sin tener que modificar socio por socio.

### Alertas y eventos

El sistema registra eventos administrativos importantes, como:

- Creacion de un socio.
- Registro de un pago.
- Cambio de plan.
- Desactivacion de un socio.
- Aplicacion de reglas mensuales.

Tambien puede generar alertas para situaciones que requieren atencion, como pagos atrasados o socios desactivados.

Esto permite tener trazabilidad: no solo ver el estado actual, sino tambien entender que acciones llevaron a ese estado.

## Por que se hizo asi

El sistema fue pensado para una gestion diaria, rapida y practica.

Por eso se priorizo:

- Separar la informacion por areas claras.
- Mostrar indicadores utiles en el dashboard.
- Evitar depender de planillas externas.
- Registrar eventos importantes para tener historial.
- Mantener el flujo simple: cargar socio, asignar plan, registrar pago y revisar estados.

La intencion no fue crear una herramienta enorme, sino una base solida para administrar un gimnasio real y poder seguir ampliandola en el futuro.

## Estado actual del sistema

El sistema ya cuenta con las funciones principales para operar:

- Acceso privado para administradores.
- Gestion de socios.
- Gestion de planes.
- Registro de pagos.
- Estados de pago.
- Reglas mensuales.
- Historial de cambios.
- Eventos y alertas administrativas.
- Dashboard separado por Socios, Pagos y Planes.

## Posibles mejoras futuras

Algunas mejoras que se podrian sumar mas adelante:

- Busqueda avanzada de socios.
- Reportes mensuales.
- Exportacion de informacion.
- Control de asistencias.
- Vencimientos automaticos.
- Roles de usuario.
- Notificaciones.
- Comprobantes de pago mas completos.
