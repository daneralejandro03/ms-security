import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

@Schema({
    timestamps: true,
})
export class Role {
    @Prop({ required: true, unique: true, index: true })
    name: string;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
    users: Types.ObjectId[];

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Access', default: [] })
    access: Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
