import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ImagenvalService } from './imagenval.service';
import { CreateImagenvalDto } from './dto/create-imagenval.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Express } from 'express';

@ApiTags('imagenval')
@Controller('imagenval')
export class ImagenvalController {
  constructor(private readonly imagenService: ImagenvalService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir dos imágenes y validar con token JWT' })
  @ApiBearerAuth('token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        fotocedula: { type: 'string', format: 'binary' },
        fotoselfie: { type: 'string', format: 'binary' },
      },
      required: ['token', 'fotocedula', 'fotoselfie'],
    },
  })
  @ApiResponse({ status: 201, description: 'Imágenes válidas para reconocimiento' })
  @ApiResponse({ status: 400, description: 'Formato o tamaño de imagen no permitido' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fotocedula', maxCount: 1 },
      { name: 'fotoselfie', maxCount: 1 },
    ]),
  )
  async upload(
    @UploadedFiles() files: { [key: string]: Express.Multer.File[] },
    @Body() body: CreateImagenvalDto,
  ) {
    const fotocedulaFile = files.fotocedula?.[0];
    const fotoselfieFile = files.fotoselfie?.[0];

    if (!fotocedulaFile || !fotoselfieFile) {
      throw new BadRequestException('Se deben enviar ambas imágenes: fotocedula y fotoselfie');
    }

    return await this.imagenService.validateTwoImages(
      [fotocedulaFile, fotoselfieFile],
      body.token,
    );
  }
}
