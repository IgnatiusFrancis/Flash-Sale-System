import jwt from "jsonwebtoken";
import { TokenGenerator } from "../../data/protocols/token-generator";

export class JwtAdapter implements TokenGenerator {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  async generateToken(value: string): Promise<string> {
    return jwt.sign({ id: value }, this.secret, { expiresIn: "1d" });
  }
}
