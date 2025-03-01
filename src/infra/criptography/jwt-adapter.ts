import jwt from "jsonwebtoken";
import { TokenGenerator } from "../../data/protocols/token-generator";

export class JwtAdapter implements TokenGenerator {
  private readonly secret: string;

  constructor(secret: string) {
    if (!secret) {
      throw new Error("JWT secret is required");
    }
    this.secret = secret;
  }

  async generateToken(id: string, role: string): Promise<string> {
    return jwt.sign({ id, role }, this.secret, { expiresIn: "1d" });
  }

  async verifyToken(
    token: string
  ): Promise<{ id: string; role: string } | null> {
    try {
      return jwt.verify(token, this.secret) as { id: string; role: string };
    } catch (error) {
      return null;
    }
  }
}
