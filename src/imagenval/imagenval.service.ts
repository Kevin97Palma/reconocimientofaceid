import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Express } from 'express';

@Injectable()
export class ImagenvalService {
  constructor(private readonly jwtService: JwtService) {}

  // Validar token JWT
  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  // Validar una imagen individual
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

  // Validar dos imágenes
  validateTwoImages(files: Express.Multer.File[], token: string) {
    this.validateToken(token);

    if (!files || files.length !== 2) {
      throw new BadRequestException('Se deben enviar dos imágenes: fotocedula y fotoselfie');
    }

    files.forEach(file => this.validateImage(file));

    return { message: 'Imágenes válidas para reconocimiento' };
  }
}
