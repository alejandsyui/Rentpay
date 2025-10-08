import React, { useState, useMemo } from 'react';
import type { RentSettings, PaymentRecord } from '../../types';
import Card from '../common/Card';

interface RentCalendarProps {
  settings: RentSettings;
  paymentHistory: PaymentRecord[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400 absolute top-1 right-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const OverdueIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600 dark:text-red-400 absolute top-1 right-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);


const RentCalendar: React.FC<RentCalendarProps> = ({ settings, paymentHistory }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo<CalendarDay[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days: CalendarDay[] = [];
    
    // Days from previous month
    const startDayOfWeek = firstDayOfMonth.getDay(); 
    for (let i = 0; i < startDayOfWeek; i++) {
      const date = new Date(year, month, i - startDayOfWeek + 1);
      days.push({ date, isCurrentMonth: false, isToday: false });
    }

    // Days of current month
    const today = new Date();
    const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isThisMonth && today.getDate() === i,
      });
    }

    // Days from next month
    const endDayOfWeek = lastDayOfMonth.getDay();
    if (endDayOfWeek < 6) {
        for (let i = 1; i <= 6 - endDayOfWeek; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false, isToday: false });
        }
    }


    return days;
  }, [currentDate]);

  const paidThisMonth = useMemo(() => 
    paymentHistory.some(p => p.month === currentDate.getMonth() && p.year === currentDate.getFullYear()),
    [paymentHistory, currentDate]
  );

  const isOverdue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const viewingYear = currentDate.getFullYear();
    const viewingMonth = currentDate.getMonth();

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();

    if (viewingYear > todayYear || (viewingYear === todayYear && viewingMonth > todayMonth)) {
        return false;
    }

    if (paidThisMonth) {
        return false;
    }

    if (viewingYear === todayYear && viewingMonth === todayMonth) {
        return today.getDate() > settings.endDay;
    }

    if (viewingYear < todayYear || (viewingYear === todayYear && viewingMonth < todayMonth)) {
        return true;
    }

    return false;
  }, [currentDate, paidThisMonth, settings]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  const getDayClass = (day: CalendarDay) => {
    let classes = 'h-12 w-12 flex items-center justify-center rounded-full text-sm transition-colors relative ';
    
    if (!day.isCurrentMonth) {
      classes += 'text-slate-400 dark:text-slate-600';
    } else {
       classes += 'text-slate-700 dark:text-slate-300';
    }

    if (day.isToday) {
      classes += ' bg-indigo-500 text-white font-bold';
    }

    const dayNumber = day.date.getDate();
    const isPaymentDay = day.isCurrentMonth && dayNumber >= settings.startDay && dayNumber <= settings.endDay;

    if (isPaymentDay) {
        if (paidThisMonth) {
             classes += ' !bg-green-100 dark:!bg-green-900/50 ring-2 ring-green-500';
        } else if (isOverdue) {
             classes += ' !bg-red-100 dark:!bg-red-900/50 ring-2 ring-red-500';
        } else if (!day.isToday) {
            classes += ' bg-indigo-100 dark:bg-indigo-900/50';
        }
    }
    
    return classes;
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  return (
    <Card title="Rent Payment Calendar" titleIcon={<CalendarIcon />}>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">&lt;</button>
        <h4 className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h4>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">&gt;</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-medium text-slate-500 dark:text-slate-400 text-xs mb-2">
        {weekdays.map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => {
            const dayNumber = day.date.getDate();
            const isPaymentDay = day.isCurrentMonth && dayNumber >= settings.startDay && dayNumber <= settings.endDay;
            return (
                <div key={index} className="flex justify-center items-center">
                    <div className={getDayClass(day)}>
                        {day.date.getDate()}
                        {isPaymentDay && paidThisMonth && <CheckIcon />}
                        {isPaymentDay && isOverdue && !paidThisMonth && <OverdueIcon />}
                    </div>
                </div>
            )
        })}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700"></div>
            <span>Payment Window</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700"></div>
            <span>Paid</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700"></div>
            <span>Overdue</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
            <span>Today</span>
        </div>
      </div>
    </Card>
  );
};

export default RentCalendar;