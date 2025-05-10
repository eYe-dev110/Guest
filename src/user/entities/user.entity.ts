import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class User {
    @ApiProperty({
        description: "ID",
        example: "User ID(Auto Increment)",
        nullable: false,
        required: true,
    })
    @IsInt()
    id: number;

    @ApiProperty({
        description: "Role",
        example: "Send User Role",
        nullable: false,
        required: true,
    })
    @IsInt()
    role: Role;

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
        description: "Password: Min 6 characters, 1 uppercase, 1 lowercase and 1 number",
        example: "Password123",
        nullable: false,
        required: true,
    })
    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password?: string;

    @ApiProperty({
        description: "Confirm Password",
        example: "Password123",
        nullable: false,
        required: true,
    })
    @IsString()
    passwordconf?: string;

    @ApiProperty({
        description: "Is active (optional, defaults to true)",
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
    
    
    @ApiProperty({
        description: "Created At",
        nullable: true,
        required: false,
        type: "string",
        example: "2022-01-01T00:00:00.000Z",
    })    
    created_at?: Date; 
    
    @ApiProperty({
        description: "Updated At",
        nullable: true,
        required: false,
        type: "string",
        example: "2022-01-01T00:00:00.000Z",
    })    
    updated_at?: Date; 
    
}



