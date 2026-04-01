import { flow, join, map, pick, values } from 'lodash/fp';

import { dayjs } from '@folio/stripes/components';
import {
  validateRequired,
  validateURLRequired,
} from '@folio/stripes-acq-components';

import {
  EDI_NAMING_TOKENS,
  FILE_FORMAT,
  INTEGRATION_TYPE,
  TRANSMISSION_METHOD,
} from './constants';

export const buildAvailableAccounts = (organization, integrations, currentIntegration) => {
  const accounts = organization.accounts.map(({ accountNo }) => accountNo);
  const usedAccounts = integrations
    .filter(({ id }) => id !== currentIntegration?.id)
    .map(integration => (
      integration?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig?.ediConfig?.accountNoList
      || []
    ))
    .flat();
  const usedAccountsSet = new Set(usedAccounts);

  return accounts.filter(account => !usedAccountsSet.has(account));
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
