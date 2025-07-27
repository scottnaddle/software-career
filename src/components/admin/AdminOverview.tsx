import React from 'react';
import { Users, UserCheck, CreditCard, BarChart3 } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  pendingExperts: number;
  approvedExperts: number;
  rejectedExperts: number;
  totalPayments: number;
  pendingPayments: number;
  monthlyRevenue: number;
  activeReviews: number;
}

interface AdminOverviewProps {
  stats: DashboardStats;
  loading: boolean;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: '총 사용자',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: '승인된 전문가',
      value: stats.approvedExperts,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: '대기중인 전문가',
      value: stats.pendingExperts,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: '총 결제',
      value: stats.totalPayments,
      icon: CreditCard,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminOverview;