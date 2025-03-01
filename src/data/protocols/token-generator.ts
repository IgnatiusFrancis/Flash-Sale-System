export interface TokenGenerator {
  generateToken(id: string, role: string): Promise<string>;
}
