# PE-2.1 Configuración y primer servicio middleware con Node.js

## Escenario (a) - Sin API Key

### Comando

```bash
curl http://localhost:3000/health
```

### Salida

```json
{"error":"API key inválida o ausente"}
```

### Explicación

La petición fue rechazada por el middleware de autenticación porque no se envió la cabecera `x-api-key`. El servidor respondió con un error 401 (Unauthorized).

---

## Escenario (b) - Con API Key válida

### Comando

```bash
curl.exe -H "x-api-key: secreto-demo" http://localhost:3000/health
```

### Salida

```json
{"status":"ok","ts":"2026-06-11T19:16:53.463Z"}
```

### Explicación

La API Key enviada es válida, por lo que el middleware permitió el acceso a la ruta `/health`. El servidor respondió correctamente con estado 200 (OK).

---

## Escenario (c) - Ruta inexistente

### Comando

```bash
curl.exe -H "x-api-key: secreto-demo" http://localhost:3000/noexiste
```

### Salida

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /noexiste</pre>
</body>
</html>
```

### Explicación

La autenticación fue exitosa, pero la ruta solicitada no existe en la aplicación. Express devolvió un error 404 (Not Found).

---

## Verificación de compilación

### Comando

```bash
npx tsc --noEmit
```

### Resultado

La compilación finalizó sin errores.

### Explicación

Se verificó que el proyecto TypeScript compila correctamente y cumple con los requisitos de la práctica.

```
```

# Testing

## Ejecutar las pruebas

```bash
npm test
```

## Resultado obtenido

```text
PASS  src/middlewares/logger.test.ts
PASS  src/middlewares/auth.test.ts

Test Suites: 2 passed, 2 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.891 s
Ran all test suites.
```

### Casos probados

#### Middleware Logger

* Verifica que se invoque `next()`.
* Verifica que registre correctamente el método y la ruta de la petición.

#### Middleware API Key

* Header `x-api-key` ausente → respuesta HTTP 401.
* API Key incorrecta → respuesta HTTP 401.
* API Key válida (`secreto-demo`) → invoca `next()` sin generar respuesta.

## Endpoint documentado

### POST /v2/inscripciones

Permite registrar una inscripción académica de un estudiante.

#### Header requerido

| Header    | Valor        |
| --------- | ------------ |
| x-api-key | secreto-demo |

#### Body

```json
{
  "estudianteID": "123",
  "materias": ["Middleware"],
  "periodoID": "2026-A",
  "metodo_pago": "Transferencia"
}
```

#### Respuesta exitosa (201)

```json
{
  "version": "v2",
  "message": {
    "estudianteID": "123",
    "materias": ["Middleware"],
    "periodoID": "2026-A",
    "metodo_pago": "Transferencia"
  }
}
```

#### Errores posibles

**400 Bad Request**

Campos obligatorios faltantes o método de pago inválido.

**401 Unauthorized**

API key inválida o ausente.

## Versionado

### Cambio compatible (Backward Compatible)

Agregar un campo opcional llamado `correoInstitucional` al body de la inscripción.

**Justificación:**
Los clientes existentes seguirán funcionando porque el nuevo campo no es obligatorio.

### Cambio incompatible (Breaking Change)

Cambiar el nombre del campo `estudianteID` por `idEstudiante`.

**Justificación:**
Los clientes actuales envían `estudianteID`. Si el servidor deja de aceptarlo, las aplicaciones existentes producirán errores y dejarán de funcionar correctamente.

## Reflexión

Si otro equipo comenzara a consumir esta API mañana, realizaría varias mejoras al contrato OpenAPI para facilitar su integración. En primer lugar, agregaría ejemplos más detallados de solicitudes y respuestas para cada endpoint, incluyendo casos exitosos y de error. También documentaría de forma más precisa los códigos de estado HTTP y los posibles mensajes de error devueltos por la API. Además, incorporaría esquemas reutilizables para evitar duplicación de información y facilitar el mantenimiento del contrato. Finalmente, ampliaría la documentación de autenticación y versionado para que futuros cambios puedan implementarse sin afectar a los consumidores existentes de la API.
