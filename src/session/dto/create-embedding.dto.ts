import { IsArray, IsString, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class FaceDataDto {
  @IsString()
  image_url: string;

  @IsArray()
  @IsNumber({}, { each: true })
  embedding: number[];

  @IsNumber()
  camera_id: number;

  @IsNumber()
  camera_sub_id: number;
}

export class BatchFaceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaceDataDto)
  data: FaceDataDto[];
}

export interface CustomerEmbedding {
    id: number;
    embedding: number[];
    lastUpdated: Date;
}