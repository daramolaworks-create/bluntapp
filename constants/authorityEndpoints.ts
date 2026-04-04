export const authorityEndpoints: Record<string, string> = {
  'fbi-tips': 'tips@fbi.gov',
  'osha-complaints': 'osha.complaints@dol.gov',
  'sec-whistleblower': 'whistleblower@sec.gov',
  'uk-action-fraud': 'report@actionfraud.police.uk',
  'uk-hse': 'concerns@hse.gov.uk',
  'eu-olaf': 'olaf-fmb-spe@ec.europa.eu',
  'eu-edpb': 'edpb@edpb.europa.eu',
};

export const getEndpointForAuthority = (authorityId: string): string => {
  return authorityEndpoints[authorityId] || 'support@bluntapp.com';
};
