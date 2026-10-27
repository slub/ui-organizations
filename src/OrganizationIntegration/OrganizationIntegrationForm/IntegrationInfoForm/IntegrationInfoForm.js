import get from 'lodash/get';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import {
  Field,
  useForm,
} from 'react-final-form';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  Accordion,
  Checkbox,
  Col,
  Row,
  Select,
  TextArea,
  TextField,
} from '@folio/stripes/components';
import { validateRequired } from '@folio/stripes-acq-components';

import {
  EXPORT_TYPES,
  FILE_FORMAT,
  INTEGRATION_TYPE,
  TRANSMISSION_METHOD,
} from '../../constants';
import { AccountNumbersInUseBanner } from '../../AccountNumbersInUseBanner';
import { AcquisitionMethodsInUseBanner } from '../../AcquisitionMethodsInUseBanner';
import {
  buildAvailableAccounts,
  getAccountOptions,
  getAcqMethodOptions,
  getClaimingTransmissionMethodOptions,
  getFileFormatOptions,
  getIntegrationTypeOptions,
  getTransmissionMethodOptions,
  isClaimingIntegration,
  isFileFormatEDI,
  isOrderingIntegration,
  isTransmissionMethodEmail,
  isTransmissionMethodFTP,
  validateAccountNumbersField,
  validateAcquisitionMethodsField,
} from '../../utils';

const ACCOUNT_NO_LIST_FIELD = 'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.accountNoList';
const NO_ACCOUNTS = [];

export const IntegrationInfoForm = ({
  acqMethods,
  defaultIntegration,
  integrationConfigs,
  organization,
}) => {
  const intl = useIntl();
  const {
    batch,
    change,
    getState,
  } = useForm();

  const {
    initialValues,
    values: formValues,
  } = getState() || {};

  const isFormatEDI = isFileFormatEDI(formValues);
  const isClaimingType = isClaimingIntegration(formValues);
  const isOrderingType = isOrderingIntegration(formValues);
  const isMethodEmail = isTransmissionMethodEmail(formValues);
  const isMethodFTP = isTransmissionMethodFTP(formValues);

  const isDefaultConfig = formValues
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.isDefaultConfig;

  // Claiming ignores account numbers; only the backend's EDI validation still demands them.
  const showAccountNumbers = !isDefaultConfig && (!isClaimingType || isFormatEDI);

  const { id, type } = formValues || {};
  const storedAccounts = get(initialValues, ACCOUNT_NO_LIST_FIELD) || NO_ACCOUNTS;
  const selectedAccounts = get(formValues, ACCOUNT_NO_LIST_FIELD) || NO_ACCOUNTS;

  const accountOptions = useMemo(() => {
    // Stored accounts stay selectable until the form is saved, selected ones must not disappear on type change.
    const assignedAccounts = [...storedAccounts, ...selectedAccounts];

    return getAccountOptions(buildAvailableAccounts(organization, integrationConfigs, { id, type }, assignedAccounts));
  }, [organization, integrationConfigs, id, type, storedAccounts, selectedAccounts]);
  const acqMethodOptions = useMemo(() => getAcqMethodOptions(acqMethods), [acqMethods]);

  const integrationTypeOptions = useMemo(() => getIntegrationTypeOptions(intl), [intl]);
  const transmissionMethodOptions = useMemo(() => getTransmissionMethodOptions(intl), [intl]);
  // Ordering: only FTP and Email (no File download — original folio-org behavior)
  const orderingTransmissionMethodOptions = useMemo(
    () => transmissionMethodOptions.filter(o => o.value !== TRANSMISSION_METHOD.fileDownLoad),
    [transmissionMethodOptions],
  );
  const claimingTransmissionMethodOptions = useMemo(() => getClaimingTransmissionMethodOptions(intl), [intl]);
  const fileFormatOptions = useMemo(() => getFileFormatOptions(), []);
  // For email: CSV and EDI only (no EML), CSV is the default
  const emailFileFormatOptions = useMemo(
    () => fileFormatOptions.filter(o => o.value !== FILE_FORMAT.eml),
    [fileFormatOptions],
  );

  const configPath = 'exportTypeSpecificParameters.vendorEdiOrdersExportConfig';

  const handleIntegrationTypeChange = ({ target: { value } }) => {
    batch(() => {
      change(`${configPath}.integrationType`, value);
      // Templates are scoped per integration type, so the previous choice would be invalid.
      change(`${configPath}.ediEmail.emailTemplate`, undefined);

      switch (value) {
        case INTEGRATION_TYPE.ordering: {
          change('type', EXPORT_TYPES.edifactOrders);
          change(`${configPath}.transmissionMethod`, TRANSMISSION_METHOD.ftp);
          change(`${configPath}.fileFormat`, FILE_FORMAT.edi);
          break;
        }
        case INTEGRATION_TYPE.claiming: {
          change('type', EXPORT_TYPES.claims);
          change(`${configPath}.ediSchedule`, null);
          // The default flag only matters for order export and its field is hidden for claiming.
          change(`${configPath}.isDefaultConfig`, false);
          break;
        }
        default: break;
      }
    });
  };

  const handleTransmissionMethodChange = ({ target: { value } }) => {
    batch(() => {
      change(`${configPath}.transmissionMethod`, value);

      if (value === TRANSMISSION_METHOD.email) {
        change(`${configPath}.fileFormat`, FILE_FORMAT.csv);
      } else if (value === TRANSMISSION_METHOD.ftp && isOrderingType) {
        change(`${configPath}.fileFormat`, FILE_FORMAT.edi);
      }
    });
  };

  return (
    <Accordion
      id="integrationInfo"
      label={<FormattedMessage id="ui-organizations.integration.info" />}
    >
      {showAccountNumbers && (
        <AccountNumbersInUseBanner
          integrationConfigs={integrationConfigs}
          integrationConfig={formValues}
        />
      )}
      {isClaimingType && (
        <AcquisitionMethodsInUseBanner
          acqMethods={acqMethods}
          integrationConfigs={integrationConfigs}
          integrationConfig={formValues}
        />
      )}
      <Row>
        <Col xs={3}>
          <Field
            component={TextField}
            fullWidth
            label={<FormattedMessage id="ui-organizations.integration.info.configName" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.configName"
            required
            validate={validateRequired}
          />
        </Col>
        <Col xs={3}>
          <Field
            component={TextArea}
            fullWidth
            label={<FormattedMessage id="ui-organizations.integration.info.configDescription" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.configDescription"
          />
        </Col>

        {!isClaimingType && (
          <Col xs={3}>
            <Field
              component={Checkbox}
              type="checkbox"
              fullWidth
              label={<FormattedMessage id="ui-organizations.integration.info.isDefaultConfig" />}
              name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.isDefaultConfig"
              vertical
              disabled={Boolean(defaultIntegration)}
            />
          </Col>
        )}
      </Row>
      <Row>
        <Col xs={3}>
          <Field
            component={Select}
            dataOptions={integrationTypeOptions}
            fullWidth
            label={<FormattedMessage id="ui-organizations.integration.info.integrationType" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.integrationType"
            onChange={handleIntegrationTypeChange}
            required
          />
        </Col>
        <Col xs={3}>
          <Field
            component={Select}
            dataOptions={isOrderingType ? orderingTransmissionMethodOptions : claimingTransmissionMethodOptions}
            fullWidth
            label={<FormattedMessage id="ui-organizations.integration.info.transmissionMethod" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.transmissionMethod"
            onChange={handleTransmissionMethodChange}
            required
          />
        </Col>
        <Col xs={3}>
          <Field
            component={Select}
            dataOptions={isMethodEmail ? emailFileFormatOptions : fileFormatOptions}
            disabled={isOrderingType && isMethodFTP}
            fullWidth
            label={<FormattedMessage id="ui-organizations.integration.info.fileFormat" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.fileFormat"
            required
          />
        </Col>
      </Row>
      <Row>
        <Col
          data-test-edi-acq-methods
          xs={6}
          md={3}
        >
          <Field
            label={<FormattedMessage id="ui-organizations.integration.edi.defaultAcquisitionMethods" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.defaultAcquisitionMethods"
            component={Select}
            dataOptions={acqMethodOptions}
            fullWidth
            multiple
            required={isClaimingType}
            validate={validateAcquisitionMethodsField}
            validateFields={[]}
          />
        </Col>
        {
          showAccountNumbers && (
            <Col
              data-test-edi-account-numbers
              xs={6}
              md={3}
            >
              <Field
                label={<FormattedMessage id="ui-organizations.integration.edi.accountNumbers" />}
                name={ACCOUNT_NO_LIST_FIELD}
                component={Select}
                dataOptions={accountOptions}
                fullWidth
                multiple
                required={isFormatEDI}
                validate={validateAccountNumbersField}
              />
            </Col>
          )
        }
      </Row>
    </Accordion>
  );
};

IntegrationInfoForm.propTypes = {
  acqMethods: PropTypes.arrayOf(PropTypes.object),
  defaultIntegration: PropTypes.object,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
  organization: PropTypes.object,
};
