import supabase from '../../supabase/index.js';

const getCertificateStatusById = (certificateId) =>
  supabase
    .from('intern_certificates')
    .select('certificate_id, intern_name, is_revoked')
    .eq('certificate_id', certificateId)
    .single();

const getCertificateById = (certificateId) =>
  supabase
    .from('intern_certificates')
    .select('*')
    .eq('certificate_id', certificateId)
    .maybeSingle();

const touchLastVerifiedAt = (certificateId) =>
  supabase
    .from('intern_certificates')
    .update({ last_verified_at: new Date().toISOString() })
    .eq('certificate_id', certificateId);

const generateCertificateIdRpc = () => supabase.rpc('generate_certificate_id');

const insertCertificate = (record) =>
  supabase
    .from('intern_certificates')
    .insert([record])
    .select('*')
    .single();

const listCertificates = ({ revoked, search, offset, limitNum }) => {
  let query = supabase
    .from('intern_certificates')
    .select('*', { count: 'exact' });

  if (revoked !== undefined) {
    query = query.eq('is_revoked', revoked === 'true');
  }

  if (search) {
    query = query.or(
      `intern_name.ilike.%${search}%,certificate_id.ilike.%${search}%`
    );
  }

  return query
    .order('issued_at', { ascending: false })
    .range(offset, offset + limitNum - 1);
};

const revokeCertificateById = (certificateId) =>
  supabase
    .from('intern_certificates')
    .update({ is_revoked: true })
    .eq('certificate_id', certificateId)
    .select('*')
    .single();

const findCertificateIdCandidate = (candidateId) =>
  supabase
    .from('intern_certificates')
    .select('certificate_id')
    .eq('certificate_id', candidateId)
    .maybeSingle();

export {
  getCertificateStatusById,
  getCertificateById,
  touchLastVerifiedAt,
  generateCertificateIdRpc,
  insertCertificate,
  listCertificates,
  revokeCertificateById,
  findCertificateIdCandidate,
};
