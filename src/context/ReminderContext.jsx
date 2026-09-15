import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { reminderService } from '../services/reminderService';
import { alarmSoundService } from '../services/alarmSoundService';

const ReminderContext = createContext();

export function ReminderProvider({ children }) {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeAlarm, setActiveAlarm] = useState(null); // The reminder triggering the current active alarm modal
    const [hasNotificationPermission, setHasNotificationPermission] = useState(
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission === 'granted' : false
    );

    // Track reminders that have already alarmed in this session to prevent repeat looping
    const alarmedIdsRef = useRef(new Set());

    // Fetch reminders
    const fetchReminders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await reminderService.getReminders();
            setReminders(data);
        } catch (err) {
            console.error('Error loading reminders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    // Request desktop notification permission
    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) return false;
        try {
            const permission = await Notification.requestPermission();
            setHasNotificationPermission(permission === 'granted');
            return permission === 'granted';
        } catch {
            return false;
        }
    };

    // Add reminder
    const createReminder = async (formData) => {
        const created = await reminderService.createReminder(formData);
        setReminders(prev => [...prev, created].sort((a, b) => new Date(a.date_time) - new Date(b.date_time)));
        alarmSoundService.playNotificationChime();
        return created;
    };

    // Update reminder
    const updateReminder = async (id, updates) => {
        const updated = await reminderService.updateReminder(id, updates);
        setReminders(prev => prev.map(r => (r.id === id ? updated : r)).sort((a, b) => new Date(a.date_time) - new Date(b.date_time)));
        return updated;
    };

    // Delete reminder
    const deleteReminder = async (id) => {
        await reminderService.deleteReminder(id);
        setReminders(prev => prev.filter(r => r.id !== id));
        if (activeAlarm?.id === id) {
            setActiveAlarm(null);
        }
    };

    // Mark completed
    const markCompleted = async (id) => {
        const res = await updateReminder(id, { status: 'completada' });
        if (activeAlarm?.id === id) {
            setActiveAlarm(null);
        }
        return res;
    };

    // Snooze reminder
    const snoozeReminder = (id, minutes = 5) => {
        const reminder = reminders.find(r => r.id === id);
        if (!reminder) return;

        // Push target time or snooze time forward
        const newSnoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
        updateReminder(id, {
            snooze_until: newSnoozeTime,
            notified: false
        });

        alarmedIdsRef.current.delete(id);
        setActiveAlarm(null);
    };

    const dismissAlarm = () => {
        setActiveAlarm(null);
    };

    // Monitor alarms in background every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();

            reminders.forEach(reminder => {
                if (reminder.status === 'completada' || reminder.status === 'cancelada') return;

                const eventTime = new Date(reminder.date_time).getTime();
                const advanceMs = (reminder.notify_advance_minutes || 15) * 60 * 1000;
                const alarmThreshold = eventTime - advanceMs;

                // Check if snoozed
                if (reminder.snooze_until) {
                    const snoozeTime = new Date(reminder.snooze_until).getTime();
                    if (now < snoozeTime) return; // still snoozed
                }

                // Trigger alarm if within window [alarmThreshold, eventTime + 15 min] and not already alarmed
                const isWithinAlertWindow = now >= alarmThreshold && now <= (eventTime + 15 * 60 * 1000);

                if (isWithinAlertWindow && !alarmedIdsRef.current.has(reminder.id)) {
                    alarmedIdsRef.current.add(reminder.id);

                    // 1. Play sound
                    alarmSoundService.playUrgentAlarm();

                    // 2. Browser native notification if allowed
                    if ('Notification' in window && Notification.permission === 'granted') {
                        const typeLabels = {
                            capacitacion: '🎓 Capacitación',
                            reunion_cliente: '🤝 Reunión Comercial',
                            soporte_tecnico: '🛠️ Soporte Técnico',
                            otro: '📌 Recordatorio'
                        };
                        const modalityLabel = reminder.modality === 'zoom' ? '💻 Vía Zoom' : '🏢 Presencial';
                        const minutesLeft = Math.max(0, Math.round((eventTime - now) / 60000));
                        const timeMsg = minutesLeft === 0 ? '¡Comienza AHORA!' : `En ${minutesLeft} min`;

                        try {
                            new Notification(`⏰ ${typeLabels[reminder.type] || 'Recordatorio'} - ${timeMsg}`, {
                                body: `Cliente: ${reminder.client_name}\nModalidad: ${modalityLabel}\n${reminder.title}`,
                                icon: '/favicon.ico'
                            });
                        } catch (err) {
                            console.warn('Native notification error:', err);
                        }
                    }

                    // 3. Set active alarm for in-app modal
                    setActiveAlarm(reminder);
                }
            });
        }, 15000);

        return () => clearInterval(interval);
    }, [reminders]);

    // Derived helpers
    const todayStr = new Date().toISOString().split('T')[0];

    const todayReminders = reminders.filter(r => {
        if (!r.date_time) return false;
        const rDate = new Date(r.date_time).toISOString().split('T')[0];
        return rDate === todayStr && r.status !== 'completada';
    });

    const pendingCount = todayReminders.length;

    return (
        <ReminderContext.Provider
            value={{
                reminders,
                loading,
                activeAlarm,
                pendingCount,
                todayReminders,
                hasNotificationPermission,
                fetchReminders,
                createReminder,
                updateReminder,
                deleteReminder,
                markCompleted,
                snoozeReminder,
                dismissAlarm,
                setActiveAlarm,
                requestNotificationPermission
            }}
        >
            {children}
        </ReminderContext.Provider>
    );
}

export function useRemindersContext() {
    const context = useContext(ReminderContext);
    if (!context) {
        throw new Error('useRemindersContext must be used within a ReminderProvider');
    }
    return context;
}
