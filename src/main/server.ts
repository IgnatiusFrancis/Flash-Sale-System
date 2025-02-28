import { connectDB } from "../infra/db/mongodb/Database/mongoose-connection";
import env from "./config/env";

connectDB()
  .then(async () => {
    const app = (await import("./config/app")).default;
    app.listen(env.port, () =>
      console.log(`Server running at http://localhost:${env.port}`)
    );
  })
  .catch(console.error);
