import { send } from '../deps.js';
import * as service from '../services/userService.js';

// Logs errors (excluding validation errors)
const errorMiddleware = async(context, next) => {
  try {
    await next();
  } catch (e) {
    console.log(e);
  }
}

// Logs all requests made to the application (current time, request method, requested path, and user id (or anonymous if not authenticated))
const requestMiddleware = async({ request, session }, next) => {
  const start = new Date();
  let user_id = await service.authenticatedId({session: session});
  if (user_id === '') user_id = 'anonymous';
  console.log(`${request.method} ${request.url.pathname} at ${start} by user id ${user_id}`);
  await next();
}

// Serving static files
const serveStaticFilesMiddleware = async(context, next) => {
  if (context.request.url.pathname.startsWith('/static')) {
    const path = context.request.url.pathname.substring(7);
  
    await send(context, path, {
      root: `${Deno.cwd()}/static`
    });
  
  } else {
    await next();
  }
}

// Controls access to the application
const controlAccess = async({response, session, request}, next) => {
// Landing page at / and paths starting with /api or /auth are accessible to all
  if (!request.url.pathname.startsWith('/auth') && !(request.url.pathname === '/') && !request.url.pathname.startsWith('/api')) {
// Other paths require that the user is authenticated
    if (await service.authenticated({session: session}) === '') {
      console.log('Access denied');
      await response.redirect('/auth/login'); // Non-authenticated users are redirected to the login form at /auth/login
      console.log('Redirecting...');
    } else {
      console.log('Access granted');
      await next();
    }
  } else {
    await next();
  } 
}

export { errorMiddleware, requestMiddleware, serveStaticFilesMiddleware, controlAccess };