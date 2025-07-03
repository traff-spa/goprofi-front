export interface PurchaseRequest {
  orderReference: string;
  amount: number;
  currency: string;
  productName: string[];
  productPrice: number[];
  productCount: number[];
  clientFirstName: string;
  clientEmail: string;
  clientPhone: string;
  userId: string;
}

interface PaymentData {
  merchantAccount: string;
  merchantDomainName: string;
  merchantTransactionSecureType: string;
  merchantSignature: string;
  orderReference: string;
  orderDate: number;
  amount: number;
  currency: string;
  productName: string[];
  productPrice: number[];
  productCount: number[];
}

interface OrderData {
  orderDate: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  id: number;
  orderReference: string;
  amount: number;
  currency: string;
  signature: string;
  userId: number;
  productName: string[][];
  productPrice: number[][];
  productCount: number[][];
  paymentResponse: PaymentData;
}

export interface PurchaseResponse {
  result: {
    success: boolean;
    paymentData: PaymentData;
    paymentUrl: string;
  };
  order: OrderData;
}
