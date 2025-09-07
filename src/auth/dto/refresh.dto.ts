import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para renovação do token.
 *
 * Recebe o refresh token emitido anteriormente.
 */
export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  @IsJWT()
  refreshToken!: string;
}
