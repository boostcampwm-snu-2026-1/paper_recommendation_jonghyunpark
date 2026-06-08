import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 간단 로그인 — 비밀번호 없이 사용자가 입력한 user ID로 식별.
// 이 userId가 백엔드 저장(관심사 등)의 키가 된다. 같은 ID면 어디서든 데이터가 이어진다.

interface AuthState {
  userId: string | null
  login: (id: string) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      login: (id) => set({ userId: id.trim() }),
      logout: () => set({ userId: null }),
    }),
    { name: 'paper-rec/auth' },
  ),
)
