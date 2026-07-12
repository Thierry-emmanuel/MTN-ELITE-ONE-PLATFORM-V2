import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'generic',
    publicId?: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned no result'));
          resolve(result);
        },
      );

      upload.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    const idWithoutExtension = publicId.replace(/\.[^/.]+$/, "");
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(idWithoutExtension, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}
