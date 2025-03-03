import { connectDB } from "../infra/Database/dbConnection";
import { setupSocket } from "../infra/webSocket";
import env from "./config/env";

connectDB()
  .then(async () => {
    const app = (await import("./config/app")).default;
    const server = app.listen(env.port, () =>
      console.log(`Server running at port:${env.port}`)
    );

    setupSocket(server);
  })
  .catch(console.error);
