export class User {
    firstName: string;
    secondName?: string;
    firstLastName: string;
    secondLastName?: string;
    gender: string;
    email: string;
    password: string;
    estado?: boolean;
    cellPhone: number;
    landline?: number;
    IDType: string;
    IDNumber: string;
    verificationCode?: string;
    verificationCodeExpires?: Date;
    twoFactorCode?: string;
    twoFactorCodeExpires?: Date;
    requiresTwoFactor?: boolean;
    readonly role: string;
}
