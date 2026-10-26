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

export const ORDERING_TRANSMISSION_METHODS = [
  TRANSMISSION_METHOD.ftp,
  TRANSMISSION_METHOD.email,
];

// Claims go out through every channel, the claim stage picks one of them.
export const CLAIMING_TRANSMISSION_METHODS = [
  TRANSMISSION_METHOD.fileDownLoad,
  TRANSMISSION_METHOD.ftp,
  TRANSMISSION_METHOD.email,
];

// Shown for claiming integrations as a preview only: the backend enum does not accept it yet.
export const PLANNED_TRANSMISSION_METHOD = {
  print: 'Print',
};

export const FILE_FORMAT = {
  csv: 'CSV',
  edi: 'EDI',
};

export const ORDERS_EMAIL_TEMPLATE_SCOPE = 'orders-email';

// Email templates are filtered by scope, one per integration type (mod-template-engine `scope`).
export const TEMPLATE_SCOPE = {
  ordering: ORDERS_EMAIL_TEMPLATE_SCOPE,
  claiming: 'claims-email',
};
