//presentation/protocols/http.ts
export interface HttpResponse {
  statusCode: number;
  body: any;
}

export interface HttpRequest {
  body?: any;
  user?: {
    id: string;
    role: string;
  };
}
