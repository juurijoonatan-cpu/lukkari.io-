import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../../utils/supabase';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': SUPABASE_ANON_KEY,
  };
}

export async function triageMessage(message, hasAttachment = false) {
  const headers = await authHeaders();
  if (!headers) return null;
  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/triage-message`, {
    method: 'POST', headers,
    body: JSON.stringify({ message, has_attachment: hasAttachment }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchCourseContext(userId, courseCode) {
  if (!courseCode) return '';
  const [{ data: tocs }, { data: notes }] = await Promise.all([
    supabase.from('book_tocs')
      .select('parsed').eq('user_id', userId).eq('course_code', courseCode)
      .order('created_at', { ascending: false }).limit(1),
    supabase.from('ingested_notes')
      .select('ocr_text, topics, created_at').eq('user_id', userId).eq('course_code', courseCode)
      .order('created_at', { ascending: false }).limit(3),
  ]);

  const lines = [];
  const toc = tocs?.[0]?.parsed;
  if (toc?.chapters?.length) {
    lines.push(`Kirjan sisältö (${courseCode}):`);
    toc.chapters.slice(0, 12).forEach(c => {
      lines.push(`  ${c.num}. ${c.title}`);
      (c.sections || []).slice(0, 4).forEach(s => lines.push(`    ${s.num} ${s.title}`));
    });
  }
  if (notes?.length) {
    lines.push('', 'Käyttäjän muistiinpanot:');
    notes.forEach((n, i) => {
      lines.push(`  [${i + 1}] ${(n.topics || []).join(', ')}`);
      if (n.ocr_text) lines.push(`      ${n.ocr_text.slice(0, 240)}${n.ocr_text.length > 240 ? '…' : ''}`);
    });
  }
  return lines.join('\n');
}

export async function loadConversation(userId, contextType = 'general', contextId = null) {
  let query = supabase.from('conversations')
    .select('id, messages')
    .eq('user_id', userId)
    .eq('context_type', contextType)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (contextId) query = query.eq('context_id', contextId);
  const { data } = await query;
  return data?.[0] || null;
}

export async function saveConversation(userId, conversationId, messages, contextType = 'general', contextId = null) {
  if (conversationId) {
    await supabase.from('conversations').update({ messages }).eq('id', conversationId);
    return conversationId;
  }
  const { data } = await supabase.from('conversations').insert({
    user_id: userId,
    context_type: contextType,
    context_id: contextId,
    messages,
  }).select('id').single();
  return data?.id || null;
}
