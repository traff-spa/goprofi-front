import { request } from '../client';

import type {
    PurchaseRequest,
    PurchaseResponse
} from '@app/types';

export const purchaseService = {
  /**
   * Creates a new purchase and returns payment details from the server.
   * @param data - The purchase request data.
   * @returns A promise that resolves with the purchase response.
   */
  createPurchase: (data: PurchaseRequest) => {
    return request<PurchaseResponse>({
      url: '/purchase',
      method: 'POST',
      data,
    }).then(response => {
      return response;
    }).catch(error => {
      console.error('Error creating purchase:', error);
      throw error;
    });
  },
};