// import { Express, Router } from "express";
// import fg from "fast-glob";

// export const setupRoutes = (app: Express): void => {
//   const router = Router();
//   app.use("/api", router);
//   fg.sync("**/src/main/routes/**-routes.ts").map(async (file) =>
//     (await import(`../../../${file}`)).default(router)
//   );
// };
//
import { Express, Router } from "express";
import fg from "fast-glob";
import path from "path";

export const setupRoutes = (app: Express): void => {
  const router = Router();
  app.use("/api", router);

  // fg.sync("src/main/routes/**/**-routes.ts").map(
  //   async (file) => (await import(`../../${file}`)).default(router) // ✅ Adjust path depth
  // );

  fg.sync("src/main/routes/**/**-routes.ts").map(async (file) => {
    const normalizedPath = path.resolve(file);
    (await import(normalizedPath)).default(router);
  });
};
