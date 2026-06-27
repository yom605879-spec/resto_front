export function saveToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export function saveUser(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  removeToken();
  window.location.href = '/login';
}

export function getDefaultRoute(role) {
  switch (role) {
    case 'boss':
    case 'admin':
      return '/dashboard';
    case 'kassir':
      return '/dashboard/payments';
    case 'oshpaz':
      return '/dashboard/kitchen';
    case 'ofitsiant':
      return '/dashboard/tables-view';
    case 'mijoz':
      return '/dashboard/menu-view';
    default:
      return '/dashboard/menu-view';
  }
}
