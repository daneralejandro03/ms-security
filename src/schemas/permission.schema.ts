import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';


export type PermissionDocument = HydratedDocument<Permission>;

@Schema({
    timestamps: true,
})
export class Permission {
    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    method: string;

    @Prop({ required: true })
    module: string;

    @Prop({ required: true })
    description: string;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Access', default: [] })
    access: Types.ObjectId[];
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
