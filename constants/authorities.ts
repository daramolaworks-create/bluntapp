export interface Authority {
    id: string;
    name: string;
    type: 'police' | 'financial' | 'abuse' | 'other';
    description: string;
}

export const AUTHORITIES: Record<string, Authority[]> = {
    // Nigeria (EFCC mentioned by user)
    'NG': [
        { id: 'ng-police', name: 'Nigeria Police Force', type: 'police', description: 'General law enforcement and safety.' },
        { id: 'ng-efcc', name: 'EFCC (Economic and Financial Crimes Commission)', type: 'financial', description: 'Financial crimes, fraud, and money laundering.' },
        { id: 'ng-icpc', name: 'ICPC (Corrupt Practices Commission)', type: 'other', description: 'Public sector corruption and bribery.' },
        { id: 'ng-naptip', name: 'NAPTIP (Human Trafficking)', type: 'abuse', description: 'Trafficking in persons and related abuse.' },
    ],
    // United States
    'US': [
        { id: 'us-police', name: 'Local Police Department', type: 'police', description: 'Dispatch to nearest local precinct.' },
        { id: 'us-fbi', name: 'FBI (Federal Bureau of Investigation)', type: 'other', description: 'Federal crimes and major investigations.' },
        { id: 'us-sec', name: 'SEC (Securities and Exchange Commission)', type: 'financial', description: 'Securities fraud and financial regulation.' },
        { id: 'us-cps', name: 'Child Protective Services', type: 'abuse', description: 'Child abuse and neglect reporting.' },
    ],
    // United Kingdom
    'GB': [
        { id: 'gb-police', name: 'Police (Non-Emergency 101)', type: 'police', description: 'General police reporting.' },
        { id: 'gb-sfo', name: 'Serious Fraud Office', type: 'financial', description: 'Complex fraud and corruption.' },
        { id: 'gb-nspcc', name: 'NSPCC', type: 'abuse', description: 'Child abuse reporting and prevention.' },
    ],
    // Canada
    'CA': [
        { id: 'ca-rcmp', name: 'RCMP (Royal Canadian Mounted Police)', type: 'police', description: 'Federal and national policing.' },
        { id: 'ca-arc', name: 'Anti-Fraud Centre', type: 'financial', description: 'Fraud and identity theft.' },
    ],
    // Default fallback for other countries
    'DEFAULT': [
        { id: 'local-police', name: 'Local Police Authority', type: 'police', description: 'General law enforcement.' },
        { id: 'financial-reg', name: 'Financial Crimes Unit', type: 'financial', description: 'Financial fraud reporting.' },
        { id: 'human-rights', name: 'Human Rights Commission', type: 'other', description: 'Human rights violations.' },
    ]
};

export const getAuthoritiesForCountry = (countryCode: string | undefined): Authority[] => {
    if (!countryCode) return AUTHORITIES['DEFAULT'];
    return AUTHORITIES[countryCode] || AUTHORITIES['DEFAULT'];
};
