import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';


export type AccessDocument = HydratedDocument<Access>;

@Schema({
    timestamps: true,
})
export class Access {

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', required: true })
    role: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Permission', required: true })
    permission: Types.ObjectId;
}

export const AccessSchema = SchemaFactory.createForClass(Access);
