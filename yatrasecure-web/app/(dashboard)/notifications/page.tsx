"use client";

import React, { useState, useMemo } from "react";
import { 
  Bell, UserPlus, Wallet, AlertTriangle, Info, Sparkles,
  CheckCircle2, XCircle, Trash2, Check, Settings, Compass,
  ChevronRight, CalendarClock
} from "lucide-react";
import toast from "react-hot-toast";

type NotificationType = 'join_request' | 'trip_update' | 'expense' | 'safety' | 'system' | 'ai';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  isRead: boolean;
  actionDone?: boolean;
}

// Generate base dates for grouping
const now = new Date();
const today = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
const yesterday = new Date(now.getTime() - 26 * 60 * 60 * 1000); // 26 hours ago
const thisWeek = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago
const older = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'join_request', title: 'Join request from Rahul', message: 'Rahul wants to join your Goa Beach Escape trip.', time: today, isRead: false },
  { id: 'n2', type: 'safety', title: 'Heavy Rain Alert for Goa', message: 'Check the weather before heading out. High tides expected.', time: today, isRead: false },
  { id: 'n3', type: 'expense', title: 'New expense added', message: 'Priya added "Dinner" (₹450) – you owe ₹150.', time: yesterday, isRead: false },
  { id: 'n4', type: 'join_request', title: 'Join request from Sneha', message: 'Sneha wants to join your Manali Trek.', time: yesterday, isRead: false },
  { id: 'n5', type: 'system', title: 'Profile Verified', message: 'Your profile verification is complete! Your trust score increased.', time: thisWeek, isRead: true },
  { id: 'n6', type: 'trip_update', title: 'Trip Budget Updated', message: 'Your Manali trip budget was updated by +₹2000.', time: thisWeek, isRead: true },
  { id: 'n7', type: 'ai', title: 'New matches found', message: 'New trips matching your interests: Rishikesh Adventure.', time: older, isRead: true },
  { id: 'n8', type: 'system', title: 'Welcome to YatraSecure', message: 'Thanks for joining. Complete your profile to unlock features.', time: older, isRead: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Actions
  const handleMarkRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast('Notification dismissed', {
      icon: '🗑️',
      action: {
        label: 'Undo',
        onClick: () => {
          if (target) setNotifications(prev => [target, ...prev].sort((a,b) => b.time.getTime() - a.time.getTime()));
        }
      }
    });
  };

  const handleJoinAction = (id: string, action: 'accept' | 'decline', e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Join request ${action}ed`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, actionDone: true, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const handleSimulate = () => {
    const newNotif: Notification = {
      id: `sim-${Date.now()}`,
      type: 'expense',
      title: 'New Expense Split',
      message: 'Someone added "Snacks" (₹200) – you owe ₹50.',
      time: new Date(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    toast.success("New notification received!");
  };

  const handleCardClick = (n: Notification) => {
    handleMarkRead(n.id);
    if (n.type === 'join_request') toast(`Navigating to join requests...`, { icon: '↗️' });
    else if (n.type === 'expense') toast(`Navigating to group wallet...`, { icon: '↗️' });
    else if (n.type === 'trip_update') toast(`Navigating to trip details...`, { icon: '↗️' });
    else if (n.type === 'ai') toast(`Navigating to explore page...`, { icon: '↗️' });
    else toast(`Navigating to details...`, { icon: '↗️' });
  };

  // Grouping Logic
  const filteredNotifs = notifications.filter(n => activeTab === 'all' || !n.isRead);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const grouped = useMemo(() => {
    const groups = { today: [] as Notification[], yesterday: [] as Notification[], thisWeek: [] as Notification[], older: [] as Notification[] };
    const nowT = Date.now();
    filteredNotifs.forEach(n => {
      const diffDays = (nowT - n.time.getTime()) / (1000 * 3600 * 24);
      if (diffDays < 1) groups.today.push(n);
      else if (diffDays < 2) groups.yesterday.push(n);
      else if (diffDays < 7) groups.thisWeek.push(n);
      else groups.older.push(n);
    });
    return groups;
  }, [filteredNotifs]);

  const getIcon = (type: NotificationType) => {
    switch(type) {
      case 'join_request': return <UserPlus style={{ color: "var(--primary)" }} />;
      case 'expense': return <Wallet style={{ color: "#D97706" }} />;
      case 'safety': return <AlertTriangle style={{ color: "var(--danger)" }} />;
      case 'system': return <Info style={{ color: "var(--text3)" }} />;
      case 'trip_update': return <Compass style={{ color: "var(--success)" }} />;
      case 'ai': return <Sparkles style={{ color: "#9333EA" }} />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 60, color: "var(--text)" }}>
      
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", color: "var(--text)", letterSpacing: "-0.02em" }}>Notifications</h1>
          <p style={{ color: "var(--text2)", margin: 0, fontSize: 15 }}>Stay updated with your trips and group activities.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleSimulate} style={{ background: "var(--primary-light)", color: "var(--primary)", border: "none", padding: "10px 16px", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Simulate New
          </button>
          <button style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Settings style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* ── Tabs & Actions ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 32 }}>
          <button 
            onClick={() => setActiveTab('all')}
            style={{ padding: "12px 0", background: "none", border: "none", borderBottom: activeTab === 'all' ? "3px solid var(--primary)" : "3px solid transparent", color: activeTab === 'all' ? "var(--primary)" : "var(--text2)", fontWeight: activeTab === 'all' ? 800 : 600, fontSize: 15, cursor: "pointer" }}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('unread')}
            style={{ padding: "12px 0", background: "none", border: "none", borderBottom: activeTab === 'unread' ? "3px solid var(--primary)" : "3px solid transparent", color: activeTab === 'unread' ? "var(--primary)" : "var(--text2)", fontWeight: activeTab === 'unread' ? 800 : 600, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            Unread {unreadCount > 0 && <span style={{ background: "var(--primary)", color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 800 }}>{unreadCount}</span>}
          </button>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", color: "var(--text2)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }} className="hover:text-primary">
            <Check style={{ width: 14, height: 14 }} /> Mark all as read
          </button>
        )}
      </div>

      {/* ── Notification Feed ── */}
      {filteredNotifs.length === 0 ? (
        <div className="anim-in" style={{ textAlign: "center", padding: "80px 20px", background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)" }}>
          <div style={{ width: 80, height: 80, background: "var(--bg2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Bell style={{ width: 32, height: 32, color: "var(--text3)" }} />
          </div>
          <h3 style={{ fontSize: 22, margin: "0 0 12px", color: "var(--text)" }}>All caught up!</h3>
          <p style={{ color: "var(--text2)", marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            {activeTab === 'unread' ? "You have no unread notifications." : "You don't have any notifications yet."}
          </p>
          {activeTab === 'unread' && (
            <button onClick={() => setActiveTab('all')} style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 24px", borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>
              View All Notifications
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {Object.entries(grouped).map(([groupName, items]) => {
            if (items.length === 0) return null;
            const title = groupName === 'today' ? 'Today' : groupName === 'yesterday' ? 'Yesterday' : groupName === 'thisWeek' ? 'This Week' : 'Older';
            
            return (
              <div key={groupName} className="anim-in">
                <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>{title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {items.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleCardClick(n)}
                      style={{ 
                        background: n.isRead ? "var(--card)" : "var(--bg2)",
                        border: "1px solid",
                        borderColor: n.isRead ? "var(--border)" : "var(--border-focus)",
                        borderRadius: 16, padding: "16px 20px",
                        display: "flex", gap: 16, alignItems: "flex-start",
                        cursor: "pointer", transition: "all 0.2s",
                        position: "relative"
                      }}
                      className="hover:shadow-md hover:-translate-y-[2px]"
                    >
                      {/* Unread Dot */}
                      {!n.isRead && <div style={{ position: "absolute", left: -4, top: 24, width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}

                      {/* Icon */}
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {getIcon(n.type)}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: n.isRead ? 600 : 800, color: "var(--text)" }}>{n.title}</h4>
                          <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600, whiteSpace: "nowrap" }}>{formatTime(n.time)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: n.isRead ? "var(--text3)" : "var(--text2)", lineHeight: 1.5, marginBottom: 12 }}>{n.message}</p>
                        
                        {/* Action Buttons for Join Requests */}
                        {n.type === 'join_request' && !n.actionDone && (
                          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                            <button onClick={(e) => handleJoinAction(n.id, 'accept', e)} style={{ background: "var(--primary)", color: "white", border: "none", padding: "8px 20px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                              <CheckCircle2 style={{ width: 16, height: 16 }} /> Accept
                            </button>
                            <button onClick={(e) => handleJoinAction(n.id, 'decline', e)} style={{ background: "transparent", color: "var(--text2)", border: "1px solid var(--border)", padding: "8px 20px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                              <XCircle style={{ width: 16, height: 16 }} /> Decline
                            </button>
                          </div>
                        )}
                        {n.type === 'join_request' && n.actionDone && (
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--success)", display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                            <Check style={{ width: 14, height: 14 }} /> Request handled
                          </div>
                        )}
                      </div>

                      {/* Right side actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {!n.isRead && (
                          <button onClick={(e) => handleMarkRead(n.id, e)} title="Mark as read" style={{ background: "none", border: "none", color: "var(--primary)", padding: 6, borderRadius: "50%", cursor: "pointer" }} className="hover:bg-primary-light">
                            <Check style={{ width: 16, height: 16 }} />
                          </button>
                        )}
                        <button onClick={(e) => handleDelete(n.id, e)} title="Delete" style={{ background: "none", border: "none", color: "var(--text3)", padding: 6, borderRadius: "50%", cursor: "pointer" }} className="hover:text-danger hover:bg-danger/10">
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text3)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Logged in as test123@gmail.com
      </div>
    </div>
  );
}
