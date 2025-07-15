import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PaymentRequest {
  amount: number;
  orderName: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  serviceType: 'verification' | 'certificate';
  verificationSpeed?: 'standard' | 'express';
}

export interface PaymentResult {
  success: boolean;
  paymentKey?: string;
  orderId?: string;
  error?: string;
  transactionId?: string;
}

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  // 토스페이먼츠 결제 요청
  const requestTossPayment = async (paymentData: PaymentRequest): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    try {
      // 주문 ID 생성
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Supabase에 결제 요청 기록
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            type: paymentData.serviceType,
            service_type: paymentData.verificationSpeed || 'standard',
            amount: paymentData.amount,
            status: 'pending',
            payment_method: 'toss',
          }
        ])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 토스페이먼츠 위젯 로드 및 결제 요청
      const { loadTossPayments } = await import('@tosspayments/payment-sdk');
      
      const tossPayments = await loadTossPayments(
        import.meta.env.VITE_TOSS_CLIENT_KEY
      );

      const widgetPayment = tossPayments.widgets({
        customerKey: payment.user_id,
      });

      // 결제 위젯 렌더링
      await widgetPayment.renderPaymentMethods('#payment-method', {
        amount: {
          currency: 'KRW',
          value: paymentData.amount,
        },
      });

      // 결제 요청
      await widgetPayment.requestPayment({
        orderId,
        orderName: paymentData.orderName,
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        customerMobilePhone: paymentData.customerPhone,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });

      return {
        success: true,
        orderId,
      };
    } catch (error: any) {
      console.error('Toss payment error:', error);
      return {
        success: false,
        error: error.message || '결제 요청 중 오류가 발생했습니다.',
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // KG이니시스 결제 요청
  const requestInicisPayment = async (paymentData: PaymentRequest): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    try {
      const orderId = `INICIS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Supabase에 결제 요청 기록
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            type: paymentData.serviceType,
            service_type: paymentData.verificationSpeed || 'standard',
            amount: paymentData.amount,
            status: 'pending',
            payment_method: 'inicis',
          }
        ])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // KG이니시스 결제 폼 생성
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://mobile.inicis.com/smart/payment/';
      form.acceptCharset = 'EUC-KR';

      const formData = {
        P_MID: import.meta.env.VITE_INICIS_MID,
        P_OID: orderId,
        P_AMT: paymentData.amount.toString(),
        P_GOODS: paymentData.orderName,
        P_UNAME: paymentData.customerName,
        P_MOBILE: paymentData.customerPhone || '',
        P_EMAIL: paymentData.customerEmail,
        P_NEXT_URL: `${window.location.origin}/payment/inicis/callback`,
        P_NOTI_URL: `${window.location.origin}/api/payment/inicis/webhook`,
        P_HPP_METHOD: '1',
        P_CHARSET: 'utf8',
      };

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      return {
        success: true,
        orderId,
      };
    } catch (error: any) {
      console.error('Inicis payment error:', error);
      return {
        success: false,
        error: error.message || 'KG이니시스 결제 요청 중 오류가 발생했습니다.',
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // 카카오페이 결제 요청
  const requestKakaoPayment = async (paymentData: PaymentRequest): Promise<PaymentResult> => {
    setIsProcessing(true);
    
    try {
      const orderId = `KAKAO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 백엔드 API를 통한 카카오페이 결제 준비
      const response = await fetch('/api/payment/kakao/ready', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cid: import.meta.env.VITE_KAKAO_CID,
          partner_order_id: orderId,
          partner_user_id: paymentData.customerEmail,
          item_name: paymentData.orderName,
          quantity: 1,
          total_amount: paymentData.amount,
          tax_free_amount: 0,
          approval_url: `${window.location.origin}/payment/kakao/success`,
          cancel_url: `${window.location.origin}/payment/kakao/cancel`,
          fail_url: `${window.location.origin}/payment/kakao/fail`,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 카카오페이 결제 페이지로 리다이렉트
        window.location.href = result.next_redirect_pc_url;
        return {
          success: true,
          orderId,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Kakao payment error:', error);
      return {
        success: false,
        error: error.message || '카카오페이 결제 요청 중 오류가 발생했습니다.',
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // 결제 방법별 요청 함수
  const requestPayment = async (
    method: 'toss' | 'inicis' | 'kakao',
    paymentData: PaymentRequest
  ): Promise<PaymentResult> => {
    switch (method) {
      case 'toss':
        return requestTossPayment(paymentData);
      case 'inicis':
        return requestInicisPayment(paymentData);
      case 'kakao':
        return requestKakaoPayment(paymentData);
      default:
        return {
          success: false,
          error: '지원하지 않는 결제 방법입니다.',
        };
    }
  };

  // 결제 성공 처리
  const confirmPayment = async (paymentKey: string, orderId: string, amount: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
          provider: 'toss', // 기본값으로 toss 사용
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { 
          success: true, 
          payment: result.payment,
          receipt: result.receipt 
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      return {
        success: false,
        error: error.message || '결제 확인 중 오류가 발생했습니다.',
      };
    }
  };

  // 결제 실패 처리
  const cancelPayment = async (orderId: string, reason: string) => {
    try {
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .match({ id: orderId });

      return { success: true };
    } catch (error: any) {
      console.error('Payment cancellation error:', error);
      return {
        success: false,
        error: error.message || '결제 취소 처리 중 오류가 발생했습니다.',
      };
    }
  };

  return {
    isProcessing,
    requestPayment,
    confirmPayment,
    cancelPayment,
  };
};