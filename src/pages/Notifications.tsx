import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Budget Alert',
    message: 'You have used 85% of your monthly budget for Shopping.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Savings Goal Achieved!',
    message: 'Congratulations! You have reached 50% of your Emergency Fund goal.',
    time: '1 day ago',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Payment Reminder',
    message: 'Your Netflix subscription of $15.99 is due tomorrow.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'New Feature',
    message: 'Check out AI Insights to get personalized spending recommendations.',
    time: '3 days ago',
    read: true,
  },
];

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
};

export default function Notifications() {
  const unreadCount = sampleNotifications.filter(n => !n.read).length;

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
        <Button variant="outline" size="sm">
          Mark all as read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {sampleNotifications.map((notification, index) => {
          const config = typeConfig[notification.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                notification.read 
                  ? 'bg-secondary/30 border-border' 
                  : `${config.bg} ${config.border}`
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                notification.read ? 'bg-muted text-muted-foreground' : `${config.bg} ${config.text}`
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-semibold ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
                <p className={`text-sm mt-1 ${notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">{notification.time}</p>
              </div>

              <button className="p-2 rounded-md hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {sampleNotifications.length === 0 && (
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
