/**
 * translateValue.js
 * Centralised lookup tables for backend enum values.
 * Usage:  translateValue('status', order.status, locale)
 *         translateValue('orderType', 'delivery', locale)
 */

const TRANSLATIONS = {
  uz: {
    status: {
      new: 'Yangi',
      cooking: 'Pishirilmoqda',
      ready: "Tayyor",
      served: 'Berildi',
      paid: "To'landi",
      completed: 'Bajarildi',
      cancelled: 'Bekor qilindi',
      pending: 'Kutilmoqda',
      active: 'Faol',
      inactive: 'Nofaol',
    },
    orderType: {
      dine_in: 'Zalda',
      delivery: 'Yetkazib berish',
      takeaway: 'Olib ketish',
      table: 'Stol',
    },
    paymentMethod: {
      cash: 'Naqd pul',
      card: 'Karta',
      click: 'Click',
      payme: 'Payme',
      online: 'Online',
      transfer: "Bank o'tkazmasi",
    },
    paymentStatus: {
      paid: "To'langan",
      unpaid: "To'lanmagan",
      pending: 'Kutilmoqda',
      refunded: 'Qaytarilgan',
    },
    salaryType: {
      fixed: "Qat'iy oylik",
      percentage: 'Foizli (buyurtmadan)',
      both: "Qat'iy + Foizli",
    },
    expenseCategory: {
      'Oziq-ovqat': 'Oziq-ovqat',
      'Maosh': 'Xodimlar maoshi',
      'Ijara': 'Ijara',
      'Kommunal': 'Kommunal xizmat',
      'Soliq': "Soliq to'lovlari",
      'Boshqa': "Boshqa xarajatlar",
    },
    taskStatus: {
      pending: 'Kutilmoqda',
      in_progress: 'Jarayonda',
      done: 'Bajarildi',
      cancelled: 'Bekor qilindi',
    },
    tableStatus: {
      free: "Bo'sh",
      occupied: 'Band',
      reserved: 'Rezerv qilingan',
    },
    priority: {
      low: "Past",
      medium: "O'rta",
      high: 'Yuqori',
    },
    dayOfWeek: {
      monday: 'Dushanba',
      tuesday: 'Seshanba',
      wednesday: 'Chorshanba',
      thursday: 'Payshanba',
      friday: 'Juma',
      saturday: 'Shanba',
      sunday: 'Yakshanba',
      Mon: 'Du', Tue: 'Se', Wed: 'Ch',
      Thu: 'Pa', Fri: 'Ju', Sat: 'Sh', Sun: 'Ya',
    },
  },

  ru: {
    status: {
      new: 'Новый',
      cooking: 'Готовится',
      ready: 'Готов',
      served: 'Подан',
      paid: 'Оплачен',
      completed: 'Выполнен',
      cancelled: 'Отменён',
      pending: 'Ожидание',
      active: 'Активен',
      inactive: 'Неактивен',
    },
    orderType: {
      dine_in: 'В зале',
      delivery: 'Доставка',
      takeaway: 'Самовывоз',
      table: 'Стол',
    },
    paymentMethod: {
      cash: 'Наличные',
      card: 'Карта',
      click: 'Click',
      payme: 'Payme',
      online: 'Онлайн',
      transfer: 'Банковский перевод',
    },
    paymentStatus: {
      paid: 'Оплачено',
      unpaid: 'Не оплачено',
      pending: 'Ожидание',
      refunded: 'Возврат',
    },
    salaryType: {
      fixed: 'Фиксированная зарплата',
      percentage: 'Процент с заказов',
      both: 'Фиксированная + Процент',
    },
    expenseCategory: {
      'Oziq-ovqat': 'Продукты питания',
      'Maosh': 'Зарплата сотрудников',
      'Ijara': 'Аренда',
      'Kommunal': 'Коммунальные услуги',
      'Soliq': 'Налоги',
      'Boshqa': 'Прочие расходы',
    },
    taskStatus: {
      pending: 'Ожидание',
      in_progress: 'В процессе',
      done: 'Выполнено',
      cancelled: 'Отменено',
    },
    tableStatus: {
      free: 'Свободен',
      occupied: 'Занят',
      reserved: 'Зарезервирован',
    },
    priority: {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
    },
    dayOfWeek: {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье',
      Mon: 'Пн', Tue: 'Вт', Wed: 'Ср',
      Thu: 'Чт', Fri: 'Пт', Sat: 'Сб', Sun: 'Вс',
    },
  },

  en: {
    status: {
      new: 'New',
      cooking: 'Cooking',
      ready: 'Ready',
      served: 'Served',
      paid: 'Paid',
      completed: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending',
      active: 'Active',
      inactive: 'Inactive',
    },
    orderType: {
      dine_in: 'Dine In',
      delivery: 'Delivery',
      takeaway: 'Takeaway',
      table: 'Table',
    },
    paymentMethod: {
      cash: 'Cash',
      card: 'Card',
      click: 'Click',
      payme: 'Payme',
      online: 'Online',
      transfer: 'Bank Transfer',
    },
    paymentStatus: {
      paid: 'Paid',
      unpaid: 'Unpaid',
      pending: 'Pending',
      refunded: 'Refunded',
    },
    salaryType: {
      fixed: 'Fixed Salary',
      percentage: 'Percentage of Orders',
      both: 'Fixed + Percentage',
    },
    expenseCategory: {
      'Oziq-ovqat': 'Food & Ingredients',
      'Maosh': 'Staff Salaries',
      'Ijara': 'Rent',
      'Kommunal': 'Utilities',
      'Soliq': 'Taxes',
      'Boshqa': 'Other Expenses',
    },
    taskStatus: {
      pending: 'Pending',
      in_progress: 'In Progress',
      done: 'Done',
      cancelled: 'Cancelled',
    },
    tableStatus: {
      free: 'Free',
      occupied: 'Occupied',
      reserved: 'Reserved',
    },
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    dayOfWeek: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      Mon: 'Mon', Tue: 'Tue', Wed: 'Wed',
      Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun',
    },
  },
};

/**
 * Translate a single backend enum value.
 * @param {string} type   - 'status' | 'orderType' | 'paymentMethod' | 'paymentStatus' | 'salaryType' | 'expenseCategory' | 'taskStatus' | 'tableStatus' | 'priority' | 'dayOfWeek'
 * @param {string} value  - Raw value from backend (e.g. 'new', 'cash', 'Oziq-ovqat')
 * @param {string} locale - 'uz' | 'ru' | 'en'
 * @returns {string}      - Translated label (falls back to original value if not found)
 */
export function translateValue(type, value, locale = 'uz') {
  if (!value) return '-';
  const lang = TRANSLATIONS[locale] || TRANSLATIONS['uz'];
  const map = lang[type] || {};
  return map[value] || map[value?.toLowerCase()] || value;
}

/**
 * Translate a role key from backend.
 * @param {string} role   - 'boss' | 'admin' | 'kassir' | 'oshpaz' | 'ofitsiant' | 'mijoz'
 * @param {string} locale
 */
export function translateRole(role, locale = 'uz') {
  const ROLES = {
    uz: { boss: 'Boss (Egasi)', admin: 'Admin (Menejer)', kassir: 'Kassir', oshpaz: 'Oshpaz', ofitsiant: 'Ofitsiant', mijoz: 'Mijoz' },
    ru: { boss: 'Владелец (Boss)', admin: 'Администратор', kassir: 'Кассир', oshpaz: 'Повар', ofitsiant: 'Официант', mijoz: 'Клиент' },
    en: { boss: 'Owner (Boss)', admin: 'Manager / Admin', kassir: 'Cashier', oshpaz: 'Chef', ofitsiant: 'Waiter', mijoz: 'Customer' },
  };
  const map = ROLES[locale] || ROLES['uz'];
  return map[role] || role;
}

/**
 * Build ORDER STATUS filter labels list for UI tabs.
 */
export function getOrderStatusLabels(locale = 'uz') {
  const lang = TRANSLATIONS[locale] || TRANSLATIONS['uz'];
  const statuses = lang.status;
  return [
    { key: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' }[locale] || 'All' },
    { key: 'new', label: statuses.new },
    { key: 'cooking', label: statuses.cooking },
    { key: 'ready', label: statuses.ready },
    { key: 'served', label: statuses.served },
    { key: 'paid', label: statuses.paid },
    { key: 'cancelled', label: statuses.cancelled },
  ];
}
