/**
 * Base Domain Entity
 * Foundation for all domain entities in the Crystal Clear Architecture
 */

export abstract class DomainEntity {
  protected readonly id: string;
  protected readonly createdAt: Date;
  protected updatedAt: Date;

  constructor(id: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId(): string {
    return this.id;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected markAsModified(): void {
    this.updatedAt = new Date();
  }

  equals(other: DomainEntity): boolean {
    return this.id === other.id;
  }

  toString(): string {
    return `${this.constructor.name}[id=${this.id}]`;
  }
}
