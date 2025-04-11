export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

export interface PaginatedResponse<T> {
  totalItems: number;
  items: T[];
  limit: number;
  offset: number;
}

export interface IdempotencyRecord {
  responseBody: any;
  statusCode: number;
  createdAt: number;
}
