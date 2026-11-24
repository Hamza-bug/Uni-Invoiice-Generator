import { Users } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Customers() {
  return (
    <PagePlaceholder
      icon={Users}
      eyebrow="Relationships"
      title="Customers"
      description="Keep customer records and billing details in one place."
      emptyMessage="Customer records you add will appear here."
    />
  )
}