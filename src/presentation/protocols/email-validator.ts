//presentation/protocols/email-validator.ts
export interface EmailValidator {
  isValid(email: string): boolean;
}
