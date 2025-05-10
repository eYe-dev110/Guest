import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, MinLength, NotContains } from "class-validator";

export class RegisterUserDto {
    @ApiProperty({
        description: "Role ID (foreign key from tb_role)",
        example: 1,
        nullable: false,
        required: true,
    })
    @IsInt()
    role_id: number;

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
        description: "Login Password",
        example: "Password123",
        nullable: false,
        required: true,
    })
    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password: string;

    @ApiProperty({
        description: "Confirm Password",
        example: "Password123",
        nullable: false,
        required: true,
    })
    @IsString()
    passwordconf: string;

    @ApiProperty({
        description: "Is active (optional, defaults to true)",
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
