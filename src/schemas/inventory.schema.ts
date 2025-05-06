import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({
    timestamps: true,
})
export class Inventory {
    @Prop({ type: String, required: true })
    id: string;

    @Prop({ type: String, required: true })
    productId: string;

    @Prop({ type: String, required: true })
    movementType: string;

    @Prop({ type: Number, required: true })
    quantity: number;

    @Prop({ type: Date, required: true })
    date: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
