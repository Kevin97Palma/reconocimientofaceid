import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImagenvalService {
  private comparefaceUrl: string;
  private comparefaceApiKey: string;
  private comparefaceSecretKey: string;

  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {
    this.comparefaceUrl = this.configService.get<string>('COMPAREFACE_API_URL') || '';
    this.comparefaceApiKey = this.configService.get<string>('COMPAREFACE_API_KEY') || '';
    this.comparefaceSecretKey = this.configService.get<string>('COMPAREFACE_SECRET_KEY') || '';
  }

  // Validar token JWT usando JwtService
  validateToken(token: string) {
    try {
      return this.jwtService.verify(token, { secret: this.comparefaceSecretKey }); // misma clave usada al registrar JwtModule
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  // Validar tipo y tamaño de imagen
  validateImage(file: Express.Multer.File) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) throw new BadRequestException('Archivo no enviado');
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Formato de imagen no permitido');
    }
    if (file.size > maxSize) {
      throw new BadRequestException('El tamaño de la imagen excede el límite permitido (5MB)');
    }

    return true;
  }

  // ✅ Validar dos imágenes y enviar a compareFace
  async validateTwoImages(files: Express.Multer.File[], token: string) {
    this.validateToken(token);

    if (!files || files.length !== 2) {
      throw new BadRequestException('Se deben enviar dos imágenes: fotocedula y fotoselfie');
    }

    files.forEach(file => this.validateImage(file));

    // Guardar imágenes localmente
    const tempDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const cedulaPath = path.join(tempDir, 'fotocedula.jpg');
    const selfiePath = path.join(tempDir, 'fotoselfie.jpg');

    fs.writeFileSync(cedulaPath, files[0].buffer);
    fs.writeFileSync(selfiePath, files[1].buffer);

    // Verificación en compareFace
    return await this.verifyWithcompareFace(cedulaPath, selfiePath);
  }

  // ✅ Enviar imágenes a compareFace
  private async verifyWithcompareFace(cedulaPath: string, selfiePath: string) {
    try {
      const form = new FormData();
      form.append('source_image', fs.createReadStream(selfiePath));
      form.append('target_image', fs.createReadStream(cedulaPath));

      const response = await axios.post(
        `${this.comparefaceUrl}/api/v1/verification/verify`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'x-api-key': this.comparefaceApiKey,
          },
        },
      );

      const data = response.data;

      return {
        match: data.result?.[0]?.face_matches?.[0]?.similarity >= 0.8, // por ejemplo
        confidence: data.result?.[0]?.face_matches?.[0]?.similarity,
        message:
          data.result?.[0]?.face_matches?.[0]?.similarity >= 0.8
            ? 'Las imágenes coinciden'
            : 'Las imágenes no coinciden',
      };
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new BadRequestException('Error verificando las imágenes con compareFace');
    }
  }
}