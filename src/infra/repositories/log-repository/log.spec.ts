import { Collection } from "mongodb";
import env from "../../../main/config/env";
//import { MongoHelper } from "../helpers/mongo-helper";
import { LogMongoRepository } from "./log";

const makeSut = (): LogMongoRepository => {
  return new LogMongoRepository();
};

describe("Log Mongo Repository", () => {
  let errorCollection: Collection;

  beforeAll(async () => {
    // await MongoHelper.connect(env.mongoUrl);
  });
  afterAll(async () => {
    //  await MongoHelper.disconnect();
  });
  beforeEach(async () => {
    //errorCollection = await MongoHelper.getCollection("errors");
    errorCollection.deleteMany({});
  });

  test("should create an error log on success", async () => {
    const sut = makeSut();
    await sut.logError("any_error");
    const count = await errorCollection.countDocuments();
    expect(count).toBe(1);
  });
});
