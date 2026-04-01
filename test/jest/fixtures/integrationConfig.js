export const integrationConfig = {
  id: 'e9b57fab-1850-44d4-8499-71fd15c845a0',
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      vendorId: 'f0b57fab-1850-44d4-8499-71fd15c845tb',
      configName: 'testConfig',
      configDescription: 'testDescription',
      accountNumbers: ['123'],
      ediConfig: {
        libEdiType: '014/EAN',
        vendorEdiType: '31B/US-SAN',
      },
      ediFtp: {
        ftpConnMode: 'Active',
        ftpFormat: 'SFTP',
        ftpMode: 'ASCII',
      },
      ediEmail: {
        emailFrom: 'orders@library.org',
        recipient: 'primaryEmail',
        emailTemplate: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      },
      ediSchedule: {
        enableScheduledExport: true,
        scheduleParameters: {
          weekDays: ['MONDAY'],
        },
      },
    },
  },
};
