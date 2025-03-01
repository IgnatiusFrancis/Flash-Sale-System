import jwt from "jsonwebtoken";

export class JwtAdapter {
  private readonly secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  async generateToken(value: string): Promise<string> {
    return jwt.sign({ id: value }, this.secret, { expiresIn: "1d" });
  }

  async verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, (err, decoded) => {
        if (err) {
          reject("Invalid token");
        } else {
          resolve(decoded);
        }
      });
    });
  }
}
