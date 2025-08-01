import { createClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfilePage from '../../components/pages/ProfilePage';

export default async function Profile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <ProfilePage user={user} />;
} 