'use client';

import { useSession } from 'next-auth/react';

export default function UserGreeting() {
  const { data: session } = useSession();
  const username = session?.user?.username || session?.user?.name || 'Admin';

  return (
    <span className="font-semibold text-indigo-600">
      {username}
    </span>
  );
}

