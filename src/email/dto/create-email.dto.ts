import { IsEmail, IsNotEmpty, IsString } from 'class-validator';


export class CreateEmailDto {
    @IsEmail()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    plainText: string;
}
