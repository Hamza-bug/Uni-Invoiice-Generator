import { FileText } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Invoices() {
  return (
    <PagePlaceholder
      icon={FileText}
      eyebrow="Sales"
      title="Invoices"
      description="Create and track invoices for your customer accounts."
      emptyMessage="Invoices you create will appear here."
    />
  )
}