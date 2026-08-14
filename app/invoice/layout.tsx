export const metadata = {
  title: 'Invoice — HySky Society',
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', colorScheme: 'light' }}>
      {children}
    </div>
  )
}
