import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read_at?: string;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 알림 목록 조회
  const fetchNotifications = async (limit = 50) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.notifications || []);
        setUnreadCount(result.unreadCount || 0);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          notificationId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev =>
          prev.map(n => ({
            ...n,
            read_at: n.read_at || new Date().toISOString()
          }))
        );
        setUnreadCount(0);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // 알림 삭제
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user!.id);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // 실시간 알림 구독
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // 실시간 구독 설정
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // 브라우저 알림 (권한이 있는 경우)
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new window.Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
              tag: newNotification.id
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      const permission = await window.Notification.requestPermission();
      return permission === 'granted';
    }
    return typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted';
  };

  // 알림 생성 (테스트용)
  const createTestNotification = async (title: string, message: string, type = 'info') => {
    try {
      await supabase.rpc('create_notification', {
        p_user_id: user!.id,
        p_type: type,
        p_title: title,
        p_message: message,
        p_data: { test: true }
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    createTestNotification
  };
};

export default useNotifications;