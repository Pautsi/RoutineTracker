import { Application, Session } from "./deps.js";
import { router } from "./routes/routes.js";
import * as middleware from './middlewares/middlewares.js';
import { viewEngine, engineFactory, adapterFactory } from "./deps.js";

const app = new Application();

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();
app.use(viewEngine(oakAdapter, ejsEngine, {
    viewRoot: "./views"
}));

app.use(middleware.errorMiddleware);            // error logging middleware
app.use(middleware.serveStaticFilesMiddleware); // middleware for serving static files

const session = new Session({ framework: "oak" });
await session.init();
app.use(session.use()(session));

app.use(middleware.requestMiddleware);          // middleware for logging requests
app.use(middleware.controlAccess);              // middleware controlling access based on authentication

app.use(router.routes());


app.listen({ port: 7777 });

  
export default app;
export { session };