import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { ImagenvalModule } from './imagenval.module';
import { TokenidModule } from 'src/tokenid/tokenid.module';

@Module({
  // Esto carga el archivo .env automáticamente
  imports: [
    ConfigModule.forRoot(), 
    ImagenvalModule,
    TokenidModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// Inyectamos el servicio de configuración para acceder a las variables de entorno.
import { 
  Controller, Post, UploadedFiles, UseInterceptors, Body, BadRequestException, UnauthorizedException 
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ImagenvalService } from './imagenval.service';
import { CreateImagenvalDto } from './dto/create-imagenval.dto';
import { TokenidService } from '../tokenid/tokenid.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
// Importamos ConfigService
import { ConfigService } from '@nestjs/config'; 

@ApiTags('imagenval')
@Controller('imagenval')
export class ImagenvalController {
  // Inyectamos el servicio de configuración en el constructor
  constructor(
    private readonly imagenService: ImagenvalService,
    private readonly tokenService: TokenidService,
    private readonly configService: ConfigService, // Inyección del servicio
  ) {}

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
    },
  })
  @ApiResponse({ status: 201, description: 'Imágenes válidas para reconocimiento', schema: {
      type: 'object',
      properties: {
        match: { type: 'boolean', example: true },
        similarity: { type: 'number', example: 0.98 },
        message: { type: 'string', example: 'Las imágenes coinciden' }
      }
  }})
  @ApiResponse({ status: 400, description: 'Formato o tamaño de imagen no permitido' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  @UseInterceptors(AnyFilesInterceptor())
  async upload(@UploadedFiles() files: Express.Multer.File[], @Body() body: CreateImagenvalDto) {
    // Validar token JWT
    try {
      this.tokenService.validateToken(body.token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }

    // Validar que existan ambas imágenes
    if (!files || files.length !== 2) {
      throw new BadRequestException('Se deben enviar dos imágenes: fotocedula y fotoselfie');
    }

    // Validar tipo y tamaño de archivos
    files.forEach(file => this.imagenService.validateImage(file));

    // Guardar temporalmente
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const cedulaPath = path.join(uploadsDir, 'fotocedula.jpg');
    const selfiePath = path.join(uploadsDir, 'fotoselfie.jpg');
    fs.writeFileSync(cedulaPath, files[0].buffer);
    fs.writeFileSync(selfiePath, files[1].buffer);

    // Convertir a Base64
    const sourceImageBase64 = fs.readFileSync(selfiePath, { encoding: 'base64' });
    const targetImageBase64 = fs.readFileSync(cedulaPath, { encoding: 'base64' });

    // Obtener la URL desde la variable de entorno
    const compareFaceApiUrl = this.configService.get<string>('COMPAREFACE_API_URL');
    const comparefaceSecretKey = this.configService.get<string>('COMPAREFACE_SECRET_KEY');

    // Enviar a compareFace y transformar la respuesta
    try {
      // Usamos la variable de entorno definida antes    
      const response = await axios.post(
        `${compareFaceApiUrl}/api/v1/verification/verify`, 
        { source_image: sourceImageBase64, target_image: targetImageBase64 },
        { headers: { 'Content-Type': 'application/json', 'x-api-key': comparefaceSecretKey } }
      );

      // Transformar para que coincida con la documentación
      const faceMatch = response.data.result[0]?.face_matches[0];
      const similarity = faceMatch?.similarity || 0;
      const match = similarity >= 0.8; // ejemplo de umbral
      return {
        match,
        similarity,
        message: match ? 'Las imágenes coinciden' : 'Las imágenes no coinciden',
        sourceFaceBox: response.data.result[0]?.source_image_face?.box,
        sourceFaceProbability: response.data.result[0]?.source_image_face?.probability,
        targetFaceBox: faceMatch?.box,
        targetFaceProbability: faceMatch?.probability,
      };

    } catch (error) {
      throw new BadRequestException('Error en la verificación de rostro: ' + error.message);
    }
  }
}

