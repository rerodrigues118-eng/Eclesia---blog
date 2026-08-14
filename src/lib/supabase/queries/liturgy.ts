import { supabaseServer } from '../server';

export interface DBLiturgia {
  id: string;
  date: string;
  liturgical_season: string;
  liturgical_color: string;
  color_hex: string;
  full_date_str: string;
  first_reading: any;
  psalm: any;
  second_reading?: any;
  gospel: any;
  source?: string;
  inserted_manually?: boolean;
}

export async function getLiturgyByDate(dateStr?: string): Promise<DBLiturgia | null> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseServer
    .from('daily_liturgy')
    .select('*')
    .eq('date', targetDate)
    .single();

  if (error) {
    console.error('[liturgy] getLiturgyByDate error:', error);
    return null;
  }
  return data;
}
