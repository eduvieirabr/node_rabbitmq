import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para login.
 *
 * O ValidationPipe global valida e mantém apenas as propriedades decoradas.
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
