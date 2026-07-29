'use client';

import {
  AdminVideosManager,
} from '@/components/admin/admin-videos-manager';

export default function MyVideosPage() {
  return (
    <AdminVideosManager
      mode="ASSOCIATION"
    />
  );
}