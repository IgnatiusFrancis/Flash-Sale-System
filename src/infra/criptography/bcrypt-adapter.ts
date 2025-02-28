//infra/criptography/bcrypt-adapter.ts
import bcrypt from "bcrypt";
import { Encrypter } from "../../data/protocols/encrypter";

export class BcryptAdapter implements Encrypter {
  private readonly salt: number;

  constructor(salt = 12) {
    this.salt = salt;
  }

  // Hashing method (encrypt)
  async encrypt(value: string): Promise<string> {
    return this.hash(value);
  }

  // Hashing method alias
  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, this.salt);
  }

  // Compare plaintext with hash
  async compare(value: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(value, hash);
  }

  // // Generate a new salt (if needed dynamically).
  // async generateSalt(rounds = this.salt): Promise<string> {
  //   try {
  //     console.log("rounds...", rounds);
  //     const salt = await bcrypt.genSalt(rounds);
  //     console.log("rounds...", rounds);
  //     return salt;
  //   } catch (error) {
  //     throw new Error("Unexpected error");
  //   }
  // }
}
