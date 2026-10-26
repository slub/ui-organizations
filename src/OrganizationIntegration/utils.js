import { flow, join, map, pick, values } from 'lodash/fp';
import { FormattedMessage } from 'react-intl';

import { dayjs } from '@folio/stripes/components';
import {
  validateRequired,
  validateURLRequired,
} from '@folio/stripes-acq-components';

import {
  EDI_NAMING_TOKENS,
  EXPORT_TYPES,
  FILE_FORMAT,
  INTEGRATION_TYPE,
  PLANNED_TRANSMISSION_METHOD,
  TEMPLATE_SCOPE,
  TRANSMISSION_METHOD,
} from './constants';

const isSameExportType = (integration, currentIntegration) => (
  !integration?.type
  || !currentIntegration?.type
  || integration.type === currentIntegration.type
);

// Account numbers held by other integrations of the same type, mapped to the names of those integrations.
export const getAccountNumbersInUse = (integrations, currentIntegration) => {
  const accountsInUse = new Map();

  (integrations || [])
    .filter(integration => (
      integration.id !== currentIntegration?.id
      && isSameExportType(integration, currentIntegration)
    ))
    .forEach(integration => {
      const { configName, ediConfig } = integration.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig || {};

      (ediConfig?.accountNoList || []).forEach(accountNo => {
        accountsInUse.set(accountNo, [...(accountsInUse.get(accountNo) || []), configName || integration.id]);
      });
    });

  return accountsInUse;
};

// Lists the integration's account numbers that other integrations of the same type also use,
// e.g. "123 (Name A, Name B); 456 (Name C)".
export const getAccountNumbersInUseMessage = (integrations, integration) => {
  const accountsInUse = getAccountNumbersInUse(integrations, integration);
  const { ediConfig } = integration?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig || {};

  return (ediConfig?.accountNoList || [])
    .filter(accountNo => accountsInUse.has(accountNo))
    .map(accountNo => `${accountNo} (${accountsInUse.get(accountNo).join(', ')})`)
    .join('; ');
};

// `assignedAccounts` stay available even if they are in use elsewhere or no longer exist in the organization.
export const buildAvailableAccounts = (organization, integrations, currentIntegration, assignedAccounts = []) => {
  const accountsInUse = getAccountNumbersInUse(integrations, currentIntegration);
  const availableAccounts = (organization?.accounts || [])
    .map(({ accountNo }) => accountNo)
    .filter(accountNo => !accountsInUse.has(accountNo) || assignedAccounts.includes(accountNo));

  return [...new Set([...availableAccounts, ...assignedAccounts])];
};

export const findDefaultIntegration = (integrations, currentIntegration) => {
  return integrations
    .find(integration => (
      integration.id !== currentIntegration?.id
      && integration.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig?.isDefaultConfig
    ));
};

export const getAcqMethodOptions = (acqMethods = []) => acqMethods.map(acqMethod => ({
  label: acqMethod.value,
  value: acqMethod.id,
}));

export const getAccountOptions = (accounts = []) => accounts.map(account => ({
  label: account,
  value: account,
}));

/*
  Converts time from UTC to the provided time zone and returns only the time part.
  The `time` value is expected in UTC time zone.
*/
export const getTenantTime = ({ time, timeZone }) => {
  const date = new Date().toISOString();
  const trimmedDate = date.slice(0, 11);
  const tenantDate = dayjs.utc(`${trimmedDate}${time}`).tz(timeZone).format();

  return tenantDate.slice(11, 19);
};

/*
  Build a UTC date-time string from the provided date, time and time zone.
  This function uses time and date independently from the datepicker and timepicker, which should be connected to return a correct UTC datetime.
*/
export const getSchedulingDatetime = ({ time, date, timezone }) => {
  const tenantDate = dayjs.utc(date).tz(timezone).format();
  const tenantTime = getTenantTime({ time, timeZone: timezone });
  const trimmedDate = tenantDate.slice(0, 11);
  const trimmedTime = tenantTime.slice(0, 8);
  const utcDateTime = dayjs.tz(`${trimmedDate}${trimmedTime}`, timezone).toISOString();

  return utcDateTime;
};

export const getDefaultEdiNamingConvention = () => (
  flow(
    pick([
      'organizationCode',
      'integrationName',
      'exportJobEndDate',
    ]),
    values,
    map(token => `{${token}}`),
    join('-'),
  )(EDI_NAMING_TOKENS)
);

export const getIntegrationTypeOptions = (intl) => {
  return Object.entries(INTEGRATION_TYPE).map(([key, value]) => ({
    label: intl.formatMessage({ id: `ui-organizations.integration.info.integrationType.${key}` }),
    value,
  }));
};

export const getTransmissionMethodOptions = (intl) => {
  return Object.entries(TRANSMISSION_METHOD).map(([key, value]) => ({
    label: intl.formatMessage({ id: `ui-organizations.integration.info.transmissionMethod.${key}` }),
    value,
  }));
};

// Claiming offers every method plus the planned ones as disabled options, so they show up in discussions.
export const getClaimingTransmissionMethodOptions = (intl) => {
  const plannedOptions = Object.entries(PLANNED_TRANSMISSION_METHOD).map(([key, value]) => ({
    label: intl.formatMessage({ id: `ui-organizations.integration.info.transmissionMethod.${key}` }),
    value,
    disabled: true,
  }));

  return [...getTransmissionMethodOptions(intl), ...plannedOptions];
};

export const getFileFormatOptions = () => {
  return Object.values(FILE_FORMAT).map((value) => ({
    label: value,
    value,
  }));
};

export const isFileFormat = (config, type) => {
  const integrationType = config
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.fileFormat;

  return integrationType === type;
};

export const isFileFormatEDI = (config) => {
  return isFileFormat(config, FILE_FORMAT.edi);
};

export const isTransmissionMethod = (config, type) => {
  const transmissionMethod = config
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.transmissionMethod;

  return transmissionMethod === type;
};

export const isTransmissionMethodFTP = (config) => {
  return isTransmissionMethod(config, TRANSMISSION_METHOD.ftp);
};

export const isTransmissionMethodEmail = (config) => {
  return isTransmissionMethod(config, TRANSMISSION_METHOD.email);
};

export const isIntegrationType = (config, type) => {
  const integrationType = config
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.integrationType;

  return integrationType === type;
};

export const isClaimingIntegration = (config) => {
  return isIntegrationType(config, INTEGRATION_TYPE.claiming);
};

export const isOrderingIntegration = (config) => {
  return isIntegrationType(config, INTEGRATION_TYPE.ordering);
};

export const getTemplateScope = (config) => {
  return isClaimingIntegration(config) ? TEMPLATE_SCOPE.claiming : TEMPLATE_SCOPE.ordering;
};

// Acquisition methods that other claiming integrations of the vendor with the same transmission method
// already cover, mapped to the names of those integrations. One channel should resolve to one integration.
export const getAcquisitionMethodsInUse = (integrations, currentIntegration) => {
  const methodsInUse = new Map();
  const currentConfig = currentIntegration?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

  (integrations || [])
    .filter(integration => {
      const config = integration.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig;

      return (
        integration.id !== currentIntegration?.id
        && integration.type === EXPORT_TYPES.claims
        && config?.transmissionMethod === currentConfig?.transmissionMethod
      );
    })
    .forEach(integration => {
      const { configName, ediConfig } = integration.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig || {};

      (ediConfig?.defaultAcquisitionMethods || []).forEach(methodId => {
        methodsInUse.set(methodId, [...(methodsInUse.get(methodId) || []), configName || integration.id]);
      });
    });

  return methodsInUse;
};

// Lists the claiming integration's acquisition methods that overlap with other claiming integrations,
// e.g. "Purchase (Name A, Name B); Gift (Name C)".
export const getAcquisitionMethodsInUseMessage = (integrations, integration, acqMethods = []) => {
  if (!isClaimingIntegration(integration)) return '';

  const methodsInUse = getAcquisitionMethodsInUse(integrations, integration);
  const { ediConfig } = integration?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig || {};

  return (ediConfig?.defaultAcquisitionMethods || [])
    .filter(methodId => methodsInUse.has(methodId))
    .map(methodId => {
      const methodName = acqMethods.find(({ id }) => id === methodId)?.value || methodId;

      return `${methodName} (${methodsInUse.get(methodId).join(', ')})`;
    })
    .join('; ');
};

export const getDuplicateTimestamp = ({ intl }) => {
  const timestamp = intl.formatDate(Date.now(), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

  return timestamp;
};

/* Validators */

/*
 * Returns a function that checks if the condition is met and then applies the validator.
 * If the condition is not met, it returns undefined.
 */
export const createConditionalValidator = (condition, validator) => {
  return (value, allValues, meta) => {
    return condition(allValues, value, meta) ? validator(value, allValues, meta) : undefined;
  };
};

export const validateAccountNumbersField = (...params) => {
  return createConditionalValidator(isFileFormatEDI, validateRequired)(...params);
};

// `validateRequired` lets an empty array pass, so multi-selects need their own check.
const validateRequiredList = (value) => {
  return value?.length ? undefined : <FormattedMessage id="stripes-acq-components.validation.required" />;
};

// Claiming resolves the integration by acquisition method, so the list must not be empty there.
export const validateAcquisitionMethodsField = (...params) => {
  return createConditionalValidator(isClaimingIntegration, validateRequiredList)(...params);
};

export const validateVendorEDICode = (...params) => {
  return createConditionalValidator(isFileFormatEDI, validateRequired)(...params);
};

export const validateLibraryEDICode = (...params) => {
  return createConditionalValidator(isFileFormatEDI, validateRequired)(...params);
};

export const validateFTPServerAddress = (...params) => {
  return createConditionalValidator(isTransmissionMethodFTP, validateURLRequired)(...params);
};

export const validateFTPPort = (...params) => {
  return createConditionalValidator(isTransmissionMethodFTP, validateRequired)(...params);
};
