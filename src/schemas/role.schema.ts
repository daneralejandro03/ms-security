import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { Role as EnumRole } from '../enums/role.enum';

export type RoleDocument = HydratedDocument<Role>;

@Schema({
    timestamps: true,
})
export class Role {
    @Prop({ required: true, unique: true, enum: EnumRole })
    name: string;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
    users: Types.ObjectId[];

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Access', default: [] })
    access: Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
