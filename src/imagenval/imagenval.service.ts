import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data'; // ✅ Importación por defecto

@Injectable()
export class ImagenvalService {
  private comprefaceUrl = 'http://localhost:8000'; // URL de CompreFace
  private comprefaceApiKey = '58f8b1cc-acb8-4a6c-bbae-5145bb4fd2b6'; // token ValidacionBe

  constructor(private readonly jwtService: JwtService) {}

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  validateImage(file: Express.Multer.File) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5242880; // 5MB

    if (!file) throw new BadRequestException('Archivo no enviado');
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Formato de imagen no permitido');
    }
    if (file.size > maxSize) {
      throw new BadRequestException('El tamaño de la imagen excede el límite permitido (5MB)');
    }

    return true;
  }

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

    // Verificación en CompreFace
    const result = await this.verifyWithCompreFace(cedulaPath, selfiePath);

    return result;
  }

  private async verifyWithCompreFace(cedulaPath: string, selfiePath: string) {
    try {
      const form = new FormData();
      form.append('image1', fs.createReadStream(cedulaPath));
      form.append('image2', fs.createReadStream(selfiePath));

      const response = await axios.post(
        `${this.comprefaceUrl}/api/v1/verify?face_api_key=${this.comprefaceApiKey}`,
        form,
        { headers: form.getHeaders() },
      );

      const data = response.data;

      return {
        match: data.match,
        confidence: data.confidence,
        message: data.match ? 'Las imágenes coinciden' : 'Las imágenes no coinciden',
      };
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new BadRequestException('Error verificando las imágenes con CompreFace');
    }
  }
}
