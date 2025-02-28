//data/protocols/encrypter.ts
export interface Encrypter {
  encrypt(value: string): Promise<string>; // Keeps original method for backward compatibility
  hash(value: string): Promise<string>; // Explicit hashing method
  compare(value: string, hash: string): Promise<boolean>; // Compare plaintext with hashed password
  //generateSalt(rounds?: number): Promise<string>; // Generate salt dynamically
}
