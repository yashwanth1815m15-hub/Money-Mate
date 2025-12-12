import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'text-warning',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'text-success',
  },
  info: {
    icon: Info,
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info',
  },
  welcome: {
    icon: CheckCircle,
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'text-success',
  },
  expense: {
    icon: Info,
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    text: 'text-primary',
  },
  group: {
    icon: Info,
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info',
  },
  login: {
    icon: Info,
    bg: 'bg-info/10',
    border: 'border-info/20',
    text: 'text-info',
  },
};

export default function Notifications() {
  const { notifications, unreadCount, markAllAsRead, deleteNotification, markAsRead, isLoading } = useNotifications();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification, index) => {
          const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                notification.is_read 
                  ? 'bg-secondary/30 border-border' 
                  : `${config.bg} ${config.border}`
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                notification.is_read ? 'bg-muted text-muted-foreground' : `${config.bg} ${config.text}`
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-semibold ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {notification.title}
                  </h3>
                  {!notification.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
                <p className={`text-sm mt-1 ${notification.is_read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="p-2 rounded-md hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Bell className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-heading font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground">You're all caught up!</p>
        </motion.div>
      )}
    </div>
  );
}
