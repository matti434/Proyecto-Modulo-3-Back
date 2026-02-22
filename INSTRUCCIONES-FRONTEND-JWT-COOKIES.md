# Instrucciones para el frontend: JWT en cookies

El backend ya **no devuelve el token en el cuerpo** de las respuestas de login/registro. El JWT se envía en una **cookie httpOnly** llamada `token`. El frontend debe adaptarse para no usar `localStorage` y enviar credenciales en todas las peticiones a la API.

---

## 1. Login y registro

- **No guardar** el token en `localStorage` (ni en sessionStorage).
- Tras `POST /api/auth/login` o `POST /api/auth/registro`, la respuesta solo incluye `{ exito, mensaje, usuario }`. **No hay campo `token`**.
- Guardar en estado/contexto solo el objeto `usuario` para saber que hay sesión. La cookie se envía y recibe automáticamente por el navegador.

---

## 2. Peticiones a la API (fetch / axios)

- **Incluir credenciales** en todas las peticiones al backend para que el navegador envíe la cookie:

  **Con fetch:**
  ```js
  fetch(`${API_URL}/ruta`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  ```

  **Con axios:**
  ```js
  axios.defaults.withCredentials = true;
  // o por petición:
  axios.get('/api/ruta', { withCredentials: true });
  ```

- **No enviar** el header `Authorization: Bearer ...`. El backend lee el token desde la cookie. Si ya tenías lógica que añadía ese header desde `localStorage`, **eliminarla** (o dejar de leer el token de `localStorage`).

---

## 3. Logout

- Llamar a **POST /api/auth/logout** (con `credentials: 'include'`). El backend borra la cookie.
- En el frontend: limpiar el estado de usuario (contexto, Redux, etc.) y redirigir a login o home. No hace falta borrar nada de `localStorage` relacionado con el token si ya no lo usas.

Ejemplo:
```js
const logout = async () => {
  await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  setUser(null);
  navigate('/login');
};
```

---

## 4. Comprobar si hay sesión

- Para “¿estoy logueado?”: llamar a **GET /api/auth/perfil** con `credentials: 'include'`. Si responde 200, hay sesión y el body trae el usuario; si responde 401, no hay sesión o expiró.
- No intentar leer el token desde una cookie en JavaScript: la cookie es `httpOnly`, no es accesible desde JS (es intencionado por seguridad).

---

## 5. CORS y dominio

- El backend ya tiene `credentials: true` en CORS.
- La cookie se envía solo a la **misma origen** que la API, o a un origen permitido en CORS si el backend está en otro dominio (ej. front en Netlify, back en Render). Asegúrate de que la URL base de la API (ej. `VITE_API_URL`) apunte al mismo dominio del backend para que las cookies se incluyan.

---

## Resumen de cambios en el front

| Antes (localStorage) | Ahora (cookies) |
|----------------------|------------------|
| Guardar `response.token` en `localStorage` en login/registro | No guardar token; solo guardar `usuario` en estado |
| Enviar `Authorization: Bearer ${localStorage.getItem('token')}` | No enviar Authorization; usar `credentials: 'include'` (o `withCredentials: true`) |
| Logout: borrar token de localStorage y limpiar estado | Logout: POST /api/auth/logout + limpiar estado |
| Saber si hay sesión leyendo token de localStorage | Saber si hay sesión: GET /api/auth/perfil con credentials |

Si el front ya usa un cliente HTTP centralizado (ej. un `apiClient.js`), basta con:
1. Quitar toda lectura/escritura de `localStorage` para el token.
2. Añadir `credentials: 'include'` (o equivalente) en ese cliente para todas las peticiones a la API.
3. En login/registro, no esperar `token` en la respuesta; usar solo `usuario`.
4. Añadir llamada a POST /auth/logout al cerrar sesión.
