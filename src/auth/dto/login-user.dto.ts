import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class LoginUserDto {

    @ApiProperty({
        description: "Username (max 10 characters)",
        example: "adminuser",
        nullable: false,
        required: true,
    })
    @IsString()
    @MaxLength(10)
    user_name: string;

    @ApiProperty({
        description: "User Password",
        nullable: false,
        required: true,
        type: "string",
        example: "Password123",
    })
    @IsString()
    password: string;

};
