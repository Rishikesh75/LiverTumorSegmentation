/**
 * Domain Layer - Image Path Value Object
 * Immutable value object representing an image file path
 */

export class ImagePath {
  private readonly _path: string;

  private constructor(path: string) {
    this._path = path;
  }

  static create(path: string): ImagePath {
    if (!path || path.trim().length === 0) {
      throw new Error('Image path cannot be empty');
    }
    return new ImagePath(path.trim());
  }

  get path(): string {
    return this._path;
  }

  get fileName(): string {
    return this._path.split('/').pop() || this._path;
  }

  get extension(): string {
    const parts = this._path.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  equals(other: ImagePath): boolean {
    return this._path === other._path;
  }

  toString(): string {
    return this._path;
  }
}

