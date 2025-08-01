import { createClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import VoiceChatPage from '../../components/pages/VoiceChatPage';

export default async function VoiceChat() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <VoiceChatPage user={user} />;
} 