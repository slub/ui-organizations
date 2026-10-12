import { NO_DST_TIMEZONES } from '@folio/stripes-acq-components/test/jest/fixtures';

import {
  EDI_NAMING_TOKENS,
  EXPORT_TYPES,
} from './constants';
import {
  buildAvailableAccounts,
  findDefaultIntegration,
  getAcqMethodOptions,
  getAccountNumbersInUse,
  getAccountNumbersInUseMessage,
  getAccountOptions,
  getTenantTime,
  getDefaultEdiNamingConvention,
  getSchedulingDatetime,
} from './utils';

const organization = {
  accounts: [{ accountNo: '123' }, { accountNo: '456' }, { accountNo: '789' }],
};
const integrationConfig = {
  id: 1,
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      isDefaultConfig: false,
      ediConfig: {
        accountNoList: ['456'],
      },
    },
  },
};
const integrationConfigs = [
  integrationConfig,
  {
    id: 2,
    exportTypeSpecificParameters: {
      vendorEdiOrdersExportConfig: {
        isDefaultConfig: true,
        ediConfig: {
          accountNoList: ['123'],
        },
      },
    },
  },
];

const buildIntegration = (id, type, configName, accountNoList) => ({
  id,
  type,
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      configName,
      ediConfig: { accountNoList },
    },
  },
});

const orderingIntegration = buildIntegration('ordering-1', EXPORT_TYPES.edifactOrders, 'Ordering', ['123']);
const orderingCopy = buildIntegration('ordering-2', EXPORT_TYPES.edifactOrders, 'Ordering copy', ['123']);
const claimingIntegration = buildIntegration('claiming-1', EXPORT_TYPES.claims, 'Claiming', ['456']);
const typedIntegrations = [orderingIntegration, orderingCopy, claimingIntegration];

const acqMethods = [{ id: 'acqMethodId', value: 'acqMethod' }];
const accounts = ['1'];

describe('OrganizationIntegration utils', () => {
  describe('buildAvailableAccounts', () => {
    it('should return accounts in existing configs use except current config', () => {
      expect(
        buildAvailableAccounts(organization, integrationConfigs, integrationConfig),
      ).toEqual(['456', '789']);
    });

    it('should not return accounts used by integrations of the same type for a new integration', () => {
      expect(
        buildAvailableAccounts(organization, typedIntegrations, { type: EXPORT_TYPES.edifactOrders }),
      ).toEqual(['456', '789']);
    });

    it('should return accounts used only by integrations of another type', () => {
      expect(
        buildAvailableAccounts(organization, typedIntegrations, { type: EXPORT_TYPES.claims }),
      ).toEqual(['123', '789']);
    });

    it('should return assigned accounts that another integration of the same type uses', () => {
      expect(
        buildAvailableAccounts(organization, typedIntegrations, orderingCopy, ['123']),
      ).toEqual(['123', '456', '789']);
    });

    it('should append assigned accounts that the organization no longer has', () => {
      expect(
        buildAvailableAccounts(organization, typedIntegrations, orderingCopy, ['123', 'removed']),
      ).toEqual(['123', '456', '789', 'removed']);
    });

    it('should return only assigned accounts when the organization has no accounts', () => {
      expect(buildAvailableAccounts({}, typedIntegrations, orderingCopy, ['123'])).toEqual(['123']);
    });
  });

  describe('getAccountNumbersInUse', () => {
    it('should map account numbers to the names of other integrations of the same type', () => {
      expect(
        [...getAccountNumbersInUse(typedIntegrations, orderingCopy)],
      ).toEqual([['123', ['Ordering']]]);
    });

    it('should collect all integrations that use the same account number', () => {
      expect(
        getAccountNumbersInUse(typedIntegrations, { type: EXPORT_TYPES.edifactOrders }).get('123'),
      ).toEqual(['Ordering', 'Ordering copy']);
    });

    it('should treat integrations without a type as the same type', () => {
      expect(
        [...getAccountNumbersInUse(integrationConfigs, orderingCopy).keys()],
      ).toEqual(['456', '123']);
    });

    it('should return an empty map without integrations', () => {
      expect(getAccountNumbersInUse().size).toBe(0);
    });
  });

  describe('findDefaultIntegration', () => {
    it('should find default config', () => {
      expect(findDefaultIntegration(integrationConfigs, integrationConfig)).toEqual(integrationConfigs[1]);
    });

    it('should find default config excluding current config', () => {
      const currentConfig = {
        id: 1,
        exportTypeSpecificParameters: {
          vendorEdiOrdersExportConfig: {
            isDefaultConfig: true,
          },
        },
      };

      expect(findDefaultIntegration([currentConfig], currentConfig)).not.toBeDefined();
    });
  });

  describe('getAccountNumbersInUseMessage', () => {
    it('should list the account numbers with the names of the other integrations', () => {
      const integration = buildIntegration('ordering-3', EXPORT_TYPES.edifactOrders, 'New', ['123', '789']);

      expect(getAccountNumbersInUseMessage(typedIntegrations, integration)).toBe('123 (Ordering, Ordering copy)');
    });

    it('should separate account numbers with a semicolon', () => {
      const integration = buildIntegration('ordering-3', EXPORT_TYPES.edifactOrders, 'New', ['123', '789']);
      const integrations = [...typedIntegrations, buildIntegration('ordering-4', EXPORT_TYPES.edifactOrders, 'Fourth', ['789'])];

      expect(getAccountNumbersInUseMessage(integrations, integration)).toBe('123 (Ordering, Ordering copy); 789 (Fourth)');
    });

    it('should fall back to the id of an integration without a name', () => {
      const integration = buildIntegration('ordering-3', EXPORT_TYPES.edifactOrders, 'New', ['123']);
      const nameless = buildIntegration('nameless-id', EXPORT_TYPES.edifactOrders, undefined, ['123']);

      expect(getAccountNumbersInUseMessage([nameless], integration)).toBe('123 (nameless-id)');
    });

    it('should return an empty string without conflicts', () => {
      expect(getAccountNumbersInUseMessage(typedIntegrations, claimingIntegration)).toBe('');
    });
  });

  describe('getAcqMethodOptions', () => {
    it('should return acq method options', () => {
      expect(getAcqMethodOptions(acqMethods)).toEqual([{ label: acqMethods[0].value, value: acqMethods[0].id }]);
    });
  });

  describe('getAccountOptions', () => {
    it('should return account options', () => {
      expect(getAccountOptions(accounts))
        .toEqual([{ label: accounts[0], value: accounts[0] }]);
    });
  });

  describe('getTenantTime', () => {
    it('should return tenant time', () => {
      expect(getTenantTime({ time: '23:00:00.000Z', timeZone: 'Europe/Minsk' }))
        .toEqual('02:00:00');
    });
  });

  describe('getSchedulingDatetime', () => {
    /*
      [<System timezone>]: [
        {
          date: '<Datepicker value - in UTC>',
          time: '<Timepicker value - in UTC>',
          expected: '<Expected UTC date-time>',
        },
        ...
      ]
    */
    const expectedResultsDict = {
      [NO_DST_TIMEZONES.AFRICA_DAKAR]: [{
        description: 'an user selects date "01/01/2026" and time "03:30 AM" at 12:03 AM (UTC+0).',
        date: '2026-01-01T00:00:03.000Z', // Datepicker view: 01/01/2026
        time: '03:30:00.000Z', // Timepicker view: 03:30 AM
        expected: '2026-01-01T03:30:00.000Z',
      }],
      [NO_DST_TIMEZONES.AMERICA_BOGOTA]: [
        {
          description: 'an user selects date "12/31/2025" and time "12:30 AM (12:30:00)" on 12/31/2025 at 08:25 PM (20:25:00) (UTC-5).',
          date: '2026-01-01T01:25:00.000Z', // Datepicker view: 12/31/2025
          time: '05:30:00.000Z', // Timepicker view: 12:30 AM (12:30:00)
          expected: '2025-12-31T05:30:00.000Z',
        },
        {
          description: 'an user selects date "01/01/2026" and time "06:30 PM (18:30:00)" on 01/01/2026 at 07:24 AM (07:24:00) (UTC-5).',
          date: '2026-01-01T12:24:00.000Z', // Datepicker view: 01/01/2026
          time: '23:30:00.000Z', // Timepicker view: 06:30 PM (18:30:00)
          expected: '2026-01-01T23:30:00.000Z',
        },
        {
          description: 'an user selects date "01/01/2026" and time "01:25 AM (01:25:00)" on 01/01/2026 at 03:16 PM (15:16:00) (UTC-5).',
          date: '2026-01-01T20:16:00.000Z', // Datepicker view: 01/01/2026
          time: '06:25:00.000Z', // Timepicker view: 01:25 AM (01:25:00)
          expected: '2026-01-01T06:25:00.000Z',
        },
        {
          description: 'an user selects date "01/01/2026" and time "02:00 PM (14:00:00)" on 01/01/2026 at 10:48 PM (22:48:00) (UTC-5).',
          date: '2026-01-02T03:48:00.000Z', // Datepicker view: 01/01/2026
          time: '19:00:00.000Z', // Timepicker view: 02:00 PM (14:00:00)
          expected: '2026-01-01T19:00:00.000Z',
        },
      ],
      [NO_DST_TIMEZONES.ASIA_TOKIO]: [
        {
          description: 'an user selects date "12/31/2025" and time "11:00 PM" (23:00:00) on 12/31/2025 at 02:15 PM (14:15:00) (UTC+9).',
          date: '2025-12-31T05:15:00.000Z', // Datepicker view: 12/31/2025
          time: '14:00:00.000Z', // Timepicker view: 11:00 PM (23:00:00)
          expected: '2025-12-31T14:00:00.000Z',
        },
        {
          description: 'an user selects date "01/01/2026" and time "12:30 AM" (00:30:00) on 01/01/2026 at 01:45 AM (01:45:00) (UTC+9).',
          date: '2025-12-31T16:45:00.000Z', // Datepicker view: 01/01/2026
          time: '15:30:00.000Z', // Timepicker view: 12:30 AM (00:30:00)
          expected: '2025-12-31T15:30:00.000Z',
        },
        {
          description: 'an user selects date "01/02/2026" and time "04:02 AM" (04:02:00) on 01/02/2026 at 03:25 AM (03:25:00) (UTC+9).',
          date: '2026-01-01T18:45:00.000Z', // Datepicker view: 01/02/2026
          time: '19:02:00.000Z', // Timepicker view: 04:02 AM (04:02:00)
          expected: '2026-01-01T19:02:00.000Z',
        },
      ],
    };

    describe.each(Object.keys(expectedResultsDict))('Timezone: %s', (timezone) => {
      it.each(expectedResultsDict[timezone])('should return proper UTC datetime when $description', ({ date, time, expected }) => {
        expect(getSchedulingDatetime({ date, time, timezone })).toEqual(expected);
      });
    });
  });

  describe('getDefaultEdiNamingConvention', () => {
    it('should return default EDI naming convention', () => {
      const {
        organizationCode,
        integrationName,
        exportJobEndDate,
      } = EDI_NAMING_TOKENS;

      expect(getDefaultEdiNamingConvention())
        .toEqual(`{${organizationCode}}-{${integrationName}}-{${exportJobEndDate}}`);
    });
  });
});
