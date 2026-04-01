export const EDI_CODE_TYPES = [
  { label: '31B (US-SAN)', value: '31B/US-SAN' },
  { label: '014 (EAN)', value: '014/EAN' },
  { label: '091 (Supplier-assigned ID)', value: '091/Vendor-assigned' },
  { label: '092 (Library-assigned ID)', value: '092/Customer-assigned' },
];

export const FTP_TYPES = [
  { label: 'SFTP', value: 'SFTP' },
  { label: 'FTP', value: 'FTP' },
];

export const TRANSMISSION_MODES = [
  { label: 'ASCII', value: 'ASCII' },
  { label: 'Binary', value: 'Binary' },
];

export const CONNECTION_MODES = [
  { label: 'Active', value: 'Active' },
  { label: 'Passive', value: 'Passive' },
];

export const SCHEDULE_PERIODS = {
  none: 'NONE',
  hours: 'HOUR',
  days: 'DAY',
  weeks: 'WEEK',
  months: 'MONTH',
};

export const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const EDI_NAMING_TOKENS = {
  organizationCode: 'organizationCode',
  integrationName: 'integrationName',
  exportJobEndDate: 'exportJobEndDate',
  jobID: 'jobID',
  numberSequence: 'numberSequence',
};

export const EXPORT_TYPES = {
  edifactOrders: 'EDIFACT_ORDERS_EXPORT',
  claims: 'CLAIMS',
};

export const INTEGRATION_TYPE = {
  claiming: 'Claiming',
  ordering: 'Ordering',
};

export const TRANSMISSION_METHOD = {
  fileDownLoad: 'File download',
  ftp: 'FTP',
  email: 'Email',
};

export const FILE_FORMAT = {
  csv: 'CSV',
  edi: 'EDI',
  eml: 'EML',
};

export const RECIPIENT_PRIMARY_EMAIL = 'primaryEmail';

export const ATTACHMENT_FORMAT = {
  csv: 'CSV',
  edi: 'EDI',
};
