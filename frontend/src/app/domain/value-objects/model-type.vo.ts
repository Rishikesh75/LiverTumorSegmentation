/**
 * Domain Layer - Model Type Value Object
 * Immutable value object representing a segmentation model type
 */

export class ModelType {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): ModelType {
    if (!value || value.trim().length === 0) {
      throw new Error('Model type cannot be empty');
    }
    return new ModelType(value.toLowerCase().trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: ModelType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

