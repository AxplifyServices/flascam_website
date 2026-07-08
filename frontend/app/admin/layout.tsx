import type {
  Metadata,
} from 'next';

import {
  AdminShell,
} from '@/components/admin/admin-shell';

export const metadata:
  Metadata = {
    title:
      'Administration',
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  };

export default function AdminLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}