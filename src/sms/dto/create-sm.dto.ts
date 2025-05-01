import { IsEmail, IsNotEmpty, IsString } from 'class-validator';


export class CreateSmDto {

    @IsEmail()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsNotEmpty()
    body: string;
}
