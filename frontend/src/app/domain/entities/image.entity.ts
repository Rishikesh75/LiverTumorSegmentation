/**
 * Domain Layer - Image Entity
 * Represents an uploaded or processed image in the domain
 */

import { ImagePath } from '../value-objects/image-path.vo';

export class ImageEntity {
  constructor(
    private readonly _id: string,
    private readonly _path: ImagePath,
    private readonly _uploadedAt: Date,
    private readonly _size?: number,
    private readonly _mimeType?: string
  ) {}

  static create(
    id: string,
    path: string,
    uploadedAt: Date = new Date(),
    size?: number,
    mimeType?: string
  ): ImageEntity {
    const imagePath = ImagePath.create(path);
    return new ImageEntity(id, imagePath, uploadedAt, size, mimeType);
  }

  get id(): string {
    return this._id;
  }

  get path(): ImagePath {
    return this._path;
  }

  get uploadedAt(): Date {
    return this._uploadedAt;
  }

  get size(): number | undefined {
    return this._size;
  }

  get mimeType(): string | undefined {
    return this._mimeType;
  }

  /**
   * Business rule: Check if image is recent (uploaded within last 24 hours)
   */
  isRecent(): boolean {
    const now = new Date();
    const diff = now.getTime() - this._uploadedAt.getTime();
    const hours = diff / (1000 * 60 * 60);
    return hours < 24;
  }
}

