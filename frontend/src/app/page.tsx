import { ROUTES } from '@/src/constants/routes'
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect(ROUTES.login)
}
