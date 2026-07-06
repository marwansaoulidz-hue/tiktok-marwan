import { IsOptional, IsString, IsBoolean, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() displayName?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}

export class UpdateSettingsDto {
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsBoolean() isPrivate?: boolean;
  @IsOptional() @IsBoolean() shareLocation?: boolean;
  @IsOptional() @IsBoolean() notifyMessages?: boolean;
  @IsOptional() @IsBoolean() notifyLikes?: boolean;
}
