export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'inactive' | 'invited'
  department: string
  lastLogin: Date
  createdAt: Date
}
