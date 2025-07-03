import React, { useState } from 'react';
import { Button, Modal, message } from 'antd';

import { purchaseService } from '@app/api/services/purchaseService';
import { useAuthStore } from '@/store/authStore';

import LockIcon from '@/assets/icons/lock.svg?react';
import ArrowIcon from '@/assets/icons/arrow-right.svg?react';

import type { PurchaseRequest } from '@app/types';

interface WayforpayPaymentData {
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

const redirectToWayforpay = (paymentUrl: string, paymentData: WayforpayPaymentData) => {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = paymentUrl;
  form.acceptCharset = 'utf-8';

  const createHiddenInput = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };

  for (const key in paymentData) {
    if (Object.prototype.hasOwnProperty.call(paymentData, key)) {
      const value = paymentData[key];
      
      if (Array.isArray(value)) {
        value.forEach(item => {
          createHiddenInput(`${key}[]`, item);
        });
      } else {
        createHiddenInput(key, value);
      }
    }
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

interface Props {
  purchaseModalVisible: boolean;
  setPurchaseModalVisible: (state: boolean) => void;
  testResultId: string; 
}

const PurchaseModal: React.FC<Props> = ({ purchaseModalVisible, setPurchaseModalVisible, testResultId }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      message.error("Будь ласка, увійдіть до системи, щоб продовжити.");
      return;
    }

    setLoading(true);

    const purchaseData: PurchaseRequest = {
      orderReference: `TEST-RESULT-${testResultId}-${Date.now()}`,
      amount: 1,
      currency: "UAH",
      productName: ['Розблокування повного звіту по тесту'],
      productPrice: [1],
      productCount: [1],
      clientFirstName: `${user.firstName} ${user.firstName}` || "Клієнт",
      clientEmail: user.email,
      userId: user?.id,
      testResultId: testResultId,
      returnUrl: `${window.location.origin}/results/${testResultId}`,
      // returnUrl: `${window.location.origin}/?payment_status=success&test_id=${testResultId}`,
    }

    try {
      const response = await purchaseService.createPurchase(purchaseData);

      if (response && response.result.success && response.result.paymentUrl) {
        console.log('response', response)

        redirectToWayforpay(response.result.paymentUrl, response.result.paymentData);
      } else {
        setLoading(false);
        message.error("Не вдалося створити замовлення. Спробуйте ще раз.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Purchase failed:", error);
      message.error("Під час оплати сталася помилка. Будь ласка, зверніться до підтримки.");
    }
  }

  return (
    <Modal
      footer={null}
      width={"510px"}
      closeIcon={false}
      className="purchase-modal"
      open={purchaseModalVisible}
      onCancel={() => setPurchaseModalVisible(false)}
    >
      <div className="purchase-modal__body">
        <div className="purchase-modal__title">
          Розблокуй весь результат та свою кар'єрну мапу
        </div>
        <Button
          loading={loading}
           onClick={handlePurchase}
          className="purchase-modal__button"
        >
          {loading ? 'Обробка...' : (
            <>
              <LockIcon width={18} height={18} />
              Розблокувати
              <small><ArrowIcon width={17} height={12} /></small>
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}

export default PurchaseModal;