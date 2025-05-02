import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';


export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
})
export class User {
    @Prop()
    name: string;

    @Prop()
    lastName: string;

    @Prop()
    gender: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    password: string;

    @Prop({ default: false })
    estado: boolean;

    @Prop()
    cellPhone: number;

    @Prop()
    landline: number;

    @Prop()
    IDType: string;

    @Prop()
    IDNumber: string;

    // Campos para verificación de correo electrónico
    @Prop()
    verificationCode: string;

    @Prop()
    verificationCodeExpires: Date;

    // Campos para autenticación de dos factores (2FA)
    @Prop()
    twoFactorCode: string;

    @Prop()
    twoFactorCodeExpires: Date;

    @Prop({ default: false },)
    requiresTwoFactor: boolean;

    /** Token para restablecer contraseña */
    @Prop({ type: String, default: null })
    resetPasswordToken: string | null;

    /** Expiración del token de reseteo */
    @Prop({ type: Date, default: null })
    resetPasswordExpires: Date | null;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', required: true })
    role: Types.ObjectId;

}

export const UserSchema = SchemaFactory.createForClass(User);
