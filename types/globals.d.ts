declare module '*.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module 'zod' {
  export const z: any
  export namespace z {
    export type infer<T> = any
  }
  const _default: any
  export default _default
}

declare namespace React {
  type ReactNode = any
  type ReactElement = any
  type ComponentType<P = any> = any
  type CSSProperties = any
  type Dispatch<A> = (value: A) => void
  type SetStateAction<S> = S | ((prevState: S) => S)
  type ChangeEvent<T = any> = { target: T }
  type FormEvent<T = any> = { preventDefault(): void; currentTarget: T }
  type MouseEvent<T = any> = { preventDefault(): void; stopPropagation(): void; currentTarget: T }
  type KeyboardEvent<T = any> = { key: string; metaKey?: boolean; ctrlKey?: boolean; preventDefault(): void }
  type FC<P = {}> = (props: P & { children?: ReactNode }) => ReactElement | null
  interface Context<T> { Provider: FC<{ value: T; children?: ReactNode }> }
  function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
  function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void
  function useMemo<T>(factory: () => T, deps: readonly unknown[]): T
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly unknown[]): T
  function useRef<T>(initialValue: T | null): { current: T | null }
  function useContext<T>(context: Context<T>): T
  function createContext<T>(defaultValue: T): Context<T>
}

declare namespace JSX {
  interface IntrinsicAttributes {
    key?: any
  }
  interface IntrinsicElements {
    [elemName: string]: any
  }
}

declare module 'react' {
  export type ReactNode = React.ReactNode
  export type ReactElement = React.ReactElement
  export type ComponentType<P = any> = React.ComponentType<P>
  export type CSSProperties = React.CSSProperties
  export type Dispatch<A> = React.Dispatch<A>
  export type SetStateAction<S> = React.SetStateAction<S>
  export type ChangeEvent<T = any> = React.ChangeEvent<T>
  export type FormEvent<T = any> = React.FormEvent<T>
  export type MouseEvent<T = any> = React.MouseEvent<T>
  export type KeyboardEvent<T = any> = React.KeyboardEvent<T>
  export type FC<P = {}> = React.FC<P>
  export type Context<T> = React.Context<T>
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly unknown[]): T
  export function useRef<T>(initialValue: T | null): { current: T | null }
  export function useContext<T>(context: Context<T>): T
  export function createContext<T>(defaultValue: T): Context<T>
  export const StrictMode: any
  export const Fragment: any
  const React: any
  export default React
}

declare module 'react/jsx-runtime' {
  export const jsx: any
  export const jsxs: any
  export const Fragment: any
}

declare module 'react-dom/client' {
  export function createRoot(container: any): any
}

declare namespace NodeJS {
  type Timeout = number
}

declare interface Buffer {}

declare const Buffer: any

declare module 'framer-motion' {
  export const motion: any
  export const AnimatePresence: any
  export type Variants = any
}

declare module 'lucide-react' {
  export type LucideIcon = (props: any) => any
  export const Activity: any
  export const AlertCircle: any
  export const AlertTriangle: any
  export const ArrowDownRight: any
  export const ArrowRight: any
  export const ArrowUpRight: any
  export const BarChart2: any
  export const BarChart3: any
  export const Bell: any
  export const Bot: any
  export const BrainCircuit: any
  export const Calendar: any
  export const CheckCircle: any
  export const ChevronDown: any
  export const ChevronRight: any
  export const Clock: any
  export const Cpu: any
  export const CreditCard: any
  export const Download: any
  export const Eye: any
  export const EyeOff: any
  export const FileText: any
  export const Check: any
  export const Filter: any
  export const Globe: any
  export const Heart: any
  export const Home: any
  export const LayoutDashboard: any
  export const Loader2: any
  export const Lock: any
  export const LogOut: any
  export const Mail: any
  export const MapPin: any
  export const Megaphone: any
  export const Menu: any
  export const MessageSquare: any
  export const MoreHorizontal: any
  export const MoreVertical: any
  export const Package: any
  export const Pause: any
  export const Play: any
  export const Plug: any
  export const Plus: any
  export const RefreshCw: any
  export const Save: any
  export const Search: any
  export const Send: any
  export const Settings: any
  export const Shield: any
  export const ShieldAlert: any
  export const ShieldCheck: any
  export const ShoppingBag: any
  export const ShoppingCart: any
  export const Sparkles: any
  export const Star: any
  export const Store: any
  export const Tag: any
  export const Trash2: any
  export const TrendingDown: any
  export const TrendingUp: any
  export const User: any
  export const UserPlus: any
  export const Users: any
  export const X: any
  export const Zap: any
}

declare module 'recharts' {
  export const Area: any
  export const AreaChart: any
  export const Bar: any
  export const BarChart: any
  export const CartesianGrid: any
  export const Cell: any
  export const ComposedChart: any
  export const Legend: any
  export const Line: any
  export const LineChart: any
  export const Pie: any
  export const PieChart: any
  export const ResponsiveContainer: any
  export const Tooltip: any
  export const XAxis: any
  export const YAxis: any
}

declare module 'firebase/app' {
  export type FirebaseApp = any
  export const initializeApp: any
  export const getApps: any
  export const getApp: any
}

declare module 'firebase/auth' {
  export type Auth = any
  export type User = any
  export const getAuth: any
  export const onAuthStateChanged: any
  export const signOut: any
  export const signInWithEmailAndPassword: any
  export const createUserWithEmailAndPassword: any
  export const signInWithPopup: any
  export const GoogleAuthProvider: any
  export const sendPasswordResetEmail: any
  export const updateProfile: any
  export const linkWithCredential: any
  export const EmailAuthProvider: any
  export const updatePassword: any
  export const setPersistence: any
  export const browserLocalPersistence: any
}

declare module 'firebase/firestore' {
  export const getFirestore: any
  export const collection: any
  export const query: any
  export const getDocs: any
  export const orderBy: any
  export const limit: any
  export const doc: any
  export const setDoc: any
  export const serverTimestamp: any
  export const getDoc: any
  export const where: any
  export const onSnapshot: any
  export const addDoc: any
  export const updateDoc: any
  export const writeBatch: any
  export type Firestore = any
  export type DocumentData = any
  export type Query = any
  export type Unsubscribe = any
}

declare module 'firebase/storage' {
  export const getStorage: any
}

declare module 'firebase/analytics' {
  export const getAnalytics: any
}

declare module 'firebase-admin' {
  const admin: any
  export default admin
}

declare module 'firebase-admin/app' {
  export const getApps: any
  export const initializeApp: any
  export const cert: any
}

declare module 'firebase-admin/firestore' {
  export const getFirestore: any
}

declare module 'firebase-admin/auth' {
  export const getAuth: any
}

declare module 'next/server' {
  export class NextRequest {
    json(): Promise<any>
  }
  export class NextResponse {
    static json(data: any, init?: any): any
    static next(init?: any): NextResponse
    static redirect(url: string | URL, init?: any): NextResponse
  }
}

declare module 'next/headers' {
  export const headers: any
}

declare module '@google/genai' {
  export const GoogleGenAI: any
  export const GoogleGenerativeAI: any
}

declare module 'bullmq' {
  export const Queue: any
  export const Worker: any
  export const QueueEvents: any
  export const FlowProducer: any
  export type WorkerOptions = any
  export type QueueOptions = any
  export type Job = any
}

declare module 'ioredis' {
  const IORedis: any
  export default IORedis
}

declare module '@prisma/client' {
  export const PrismaClient: any
}

declare module 'axios' {
  const axios: any
  export default axios
}

declare module '@vercel/speed-insights' {
  const SpeedInsights: any
  export default SpeedInsights
}

declare module 'openai' {
  const OpenAI: any
  export default OpenAI
}

declare module 'openai/helpers/zod' {
  export const zodResponseFormat: any
}

declare module 'resend' {
  const Resend: any
  export default Resend
}

declare module 'socket.io-client' {
  export const io: any
  export const Socket: any
}

declare module 'dotenv' {
  export const config: any
}

declare module 'vitest' {
  export const describe: any
  export const expect: any
  export const it: any
  export const vi: any
}

declare module 'assert' {
  const assert: any
  export default assert
}

declare module 'node:assert' {
  const assert: any
  export default assert
}

declare module 'crypto' {
  const crypto: any
  export default crypto
}

declare module 'node:crypto' {
  const crypto: any
  export default crypto
}

declare const crypto: any

declare const process: {
  env: Record<string, string | undefined>
  exit: (code?: number) => never
  stdout: { write: (...args: any[]) => void }
  on: (event: string, listener: (...args: any[]) => void) => void
}

declare interface ImportMetaEnv {
  readonly [key: string]: string | undefined
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}
