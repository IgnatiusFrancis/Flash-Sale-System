// import { Request, Response } from "express";

// export interface HttpResponse extends Response {
//   statusCode: number;
//   body: any;
// }

// export interface HttpRequest {
//   body?: any;
//   user?: {
//     id: string;
//     role: string;
//   };
//   ipAddress?: string;
//   userAgent?: string;
// }

import { Request, Response } from "express";

export interface HttpResponse extends Response {
  statusCode: number;
  body: any;
}

export interface HttpRequest {
  body?: any;
  query?: Record<string, string | undefined>;
  params?: Record<string, string | undefined>;
  user?: {
    id: string;
    role: string;
  };
  ipAddress?: string;
  userAgent?: string;
}
