import { LayoutDashboard } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Dashboard() {
  return (
    <PagePlaceholder
      icon={LayoutDashboard}
      eyebrow="Overview"
      title="Dashboard"
      description="A clear view of invoice, inventory, and customer activity."
      emptyMessage="Your overview will appear here as activity is recorded."
    />
  )
}