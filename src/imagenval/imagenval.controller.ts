import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ImagenvalService } from './imagenval.service';
import { CreateImagenvalDto } from './dto/create-imagenval.dto';
import { TokenidService } from '../tokenid/tokenid.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
const { v4: uuidv4 } = require('uuid');
import { ApiLogModel } from 'src/database/models/api-log.model/api-log.model';
import { InjectModel } from '@nestjs/sequelize';

@ApiTags('imagenval')
@Controller('imagenval')
export class ImagenvalController {
  constructor(
    private readonly imagenService: ImagenvalService,
    private readonly tokenService: TokenidService,
    private readonly configService: ConfigService,
    @InjectModel(ApiLogModel) private apiLogModel: typeof ApiLogModel
  ) {}

  async saveApiLog(solicitud: any, respuesta: any, mensaje: string) {
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await this.apiLogModel.create({
      solicitud_payload: solicitud,
      respuesta_payload: respuesta,
      mensaje_api: mensaje,
      fecha_registro: fecha,
    });
  }

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
  @ApiResponse({
    status: 201,
    description: 'Imágenes válidas para reconocimiento',
    schema: {
      type: 'object',
      properties: {
        match: { type: 'boolean', example: true },
        similarity: { type: 'number', example: 0.98 },
        message: { type: 'string', example: 'Las imágenes coinciden' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Formato o tamaño de imagen no permitido' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'fotocedula', maxCount: 1 },
      { name: 'fotoselfie', maxCount: 1 },
    ]),
  )
  async upload(
    @UploadedFiles()
    files: { fotocedula?: Express.Multer.File[]; fotoselfie?: Express.Multer.File[] },
    @Body('token') token: string,
  ) {    
    try {
      this.tokenService.validateToken(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }

    // 📷 Validar que existan ambas imágenes
    const cedulaFile = files.fotocedula?.[0];
    const selfieFile = files.fotoselfie?.[0];
    if (!cedulaFile || !selfieFile) {
      throw new BadRequestException('Debes enviar fotocedula y fotoselfie');
    }

    // 📏 Validar tipo y tamaño de archivos
    this.imagenService.validateImage(cedulaFile);
    this.imagenService.validateImage(selfieFile);

    // 💾 Guardar temporalmente
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const cedulaFilename = `fotocedula_${uuidv4()}.jpg`;
    const selfieFilename = `fotoselfie_${uuidv4()}.jpg`;

    const cedulaPath = path.join(uploadsDir, cedulaFilename);
    const selfiePath = path.join(uploadsDir, selfieFilename);

    fs.writeFileSync(cedulaPath, cedulaFile.buffer);
    fs.writeFileSync(selfiePath, selfieFile.buffer);

    // 🔄 Convertir a Base64
    const sourceImageBase64 = fs.readFileSync(selfiePath, { encoding: 'base64' });
    const targetImageBase64 = fs.readFileSync(cedulaPath, { encoding: 'base64' });

    fs.unlinkSync(cedulaPath);
    fs.unlinkSync(selfiePath);

    // 🌍 Obtener la URL y la KEY desde variables de entorno
    const compareFaceApiUrl = this.configService.get<string>('COMPAREFACE_API_URL');
    const comparefaceApiKey = this.configService.get<string>('COMPAREFACE_API_KEY');

    if (!compareFaceApiUrl || !comparefaceApiKey) {
      throw new BadRequestException('Faltan variables de entorno para la API de CompareFace');
    }

    // 📡 Llamar a la API externa
    try {
      const response = await axios.post(
        `${compareFaceApiUrl}/api/v1/verification/verify`,
        { source_image: sourceImageBase64, target_image: targetImageBase64 },
        { headers: { 'Content-Type': 'application/json', 'x-api-key': comparefaceApiKey } },
      );

      // 📝 Transformar respuesta
      const faceMatch = response.data.result[0]?.face_matches[0];
      const similarity = faceMatch?.similarity || 0;
      const match = similarity >= 0.8;

      const apiResponse = {
        match,
        similarity,
        message: match ? 'Las imágenes coinciden' : 'Las imágenes no coinciden',
        sourceFaceBox: response.data.result[0]?.source_image_face?.box,
        sourceFaceProbability: response.data.result[0]?.source_image_face?.probability,
        targetFaceBox: faceMatch?.box,
        targetFaceProbability: faceMatch?.probability,
      };

      // Guardar log
      await this.saveApiLog(
        { source_image: sourceImageBase64, target_image: targetImageBase64 },
        apiResponse,
        apiResponse.message,
      );

      return apiResponse;
    } catch (error) {      
      // Mostrar mensaje real de la API si lo devuelve
      const apiMsg = error.response?.data || error.message;
      
      // Guardar log
      await this.saveApiLog(
        { source_image: sourceImageBase64, target_image: targetImageBase64 },
        error.response?.data || error,
        apiMsg.message,
      );
      throw new BadRequestException('Error en la verificación de rostro: ' + JSON.stringify(apiMsg));
    }
  }
}
