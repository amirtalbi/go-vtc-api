import { IsEmail, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBusinessDto {
  @ApiProperty({ example: "Entreprise XYZ" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "SARL" })
  @IsString()
  legal_status!: string;

  @ApiProperty({ example: "123 Rue Exemple, 75000 Paris" })
  @IsString()
  address!: string;

  @ApiProperty({ example: "contact@entreprisexyz.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "12345678901234" })
  @IsString()
  @Length(14, 14)
  siret!: string;

  @ApiProperty({ example: "FR12345678901" })
  @IsString()
  @Length(13, 13)
  tva_code!: string;

  @ApiProperty({ example: "6201Z" })
  @IsString()
  @Length(5, 5)
  ape_code!: string;

  @ApiProperty({ example: "60d21b4667d0d8992e610c85" })
  @IsString()
  user!: string;
}
