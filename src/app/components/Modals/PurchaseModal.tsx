import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { purchaseService } from '@app/api/services/purchaseService';
import { useAuthStore } from '@/store/authStore';
import type { PurchaseRequest } from '@app/types';

interface Props {
  purchaseModalVisible: boolean;
  setPurchaseModalVisible: (state: boolean) => void;
  testResultId: string | undefined; 
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
      amount: 1000,
      currency: "UAH",
      productName: ['Розблокування повного звіту по тесту'],
      productPrice: [1000],
      productCount: [1],
      clientFirstName: `${user.firstName} ${user.firstName}` || "Клієнт",
      clientEmail: user.email,
      clientPhone: "+380991234567",
      userId: user?.id
    }

    try {
      const response = await purchaseService.createPurchase(purchaseData);

      if (response && response.result.success && response.result.paymentUrl) {
        window.location.href = response.result.paymentUrl;
      } else {
        message.error("Не вдалося створити замовлення. Спробуйте ще раз.");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      message.error("Під час оплати сталася помилка. Будь ласка, зверніться до підтримки.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      footer={null}
      width={"680px"}
      className="purchase-modal"
      open={purchaseModalVisible}
      onCancel={() => setPurchaseModalVisible(false)}
    >
      <div className="purchase-modal__body">
        <div className="purchase-modal__title">
          Розблокуй весь результат та свою кар'єрну мапу
        </div>
        <button
          className="purchase-modal__button"
          onClick={handlePurchase}
          disabled={loading}
        >
          {loading ? 'Обробка...' : 'Розблокувати'}
        </button>
      </div>
    </Modal>
  );
};

export default PurchaseModal;