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
import {
  buildAvailableAccounts,
  getAccountOptions,
  getFileFormatOptions,
  getIntegrationTypeOptions,
  getTransmissionMethodOptions,
  isFileFormatEDI,
  isOrderingIntegration,
  validateAccountNumbersField,
} from '../../utils';

const ACCOUNT_NO_LIST_FIELD = 'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.accountNoList';
const NO_ACCOUNTS = [];

export const IntegrationInfoForm = ({
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
  const isOrderingType = isOrderingIntegration(formValues);

  const isDefaultConfig = formValues
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.isDefaultConfig;

  const { id, type } = formValues || {};
  const storedAccounts = get(initialValues, ACCOUNT_NO_LIST_FIELD) || NO_ACCOUNTS;
  const selectedAccounts = get(formValues, ACCOUNT_NO_LIST_FIELD) || NO_ACCOUNTS;

  const accountOptions = useMemo(() => {
    // Stored accounts stay selectable until the form is saved, selected ones must not disappear on type change.
    const assignedAccounts = [...storedAccounts, ...selectedAccounts];

    return getAccountOptions(buildAvailableAccounts(organization, integrationConfigs, { id, type }, assignedAccounts));
  }, [organization, integrationConfigs, id, type, storedAccounts, selectedAccounts]);

  const integrationTypeOptions = useMemo(() => getIntegrationTypeOptions(intl), [intl]);
  const transmissionMethodOptions = useMemo(() => getTransmissionMethodOptions(intl), [intl]);
  const fileFormatOptions = useMemo(() => getFileFormatOptions(), []);

  const handleIntegrationTypeChange = ({ target: { value } }) => {
    batch(() => {
      change('exportTypeSpecificParameters.vendorEdiOrdersExportConfig.integrationType', value);

      switch (value) {
        case INTEGRATION_TYPE.ordering: {
          change('type', EXPORT_TYPES.edifactOrders);
          change('exportTypeSpecificParameters.vendorEdiOrdersExportConfig.transmissionMethod', TRANSMISSION_METHOD.ftp);
          change('exportTypeSpecificParameters.vendorEdiOrdersExportConfig.fileFormat', FILE_FORMAT.edi);
          break;
        }
        case INTEGRATION_TYPE.claiming: {
          change('type', EXPORT_TYPES.claims);
          change('exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule', null);
          break;
        }
        default: break;
      }
    });
  };

  return (
    <Accordion
      id="integrationInfo"
      label={<FormattedMessage id="ui-organizations.integration.info" />}
    >
      {!isDefaultConfig && (
        <AccountNumbersInUseBanner
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
            dataOptions={transmissionMethodOptions}
            disabled={isOrderingType}
            fullWidth
            label={<FormattedMessage id="ui-organizations.integration.info.transmissionMethod" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.transmissionMethod"
            required
          />
        </Col>
        <Col xs={3}>
          <Field
            component={Select}
            dataOptions={fileFormatOptions}
            disabled={isOrderingType}
            fullWidth
            label={<FormattedMessage id="ui-organizations.integration.info.fileFormat" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.fileFormat"
            required
          />
        </Col>
        {
          !isDefaultConfig && (
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
  defaultIntegration: PropTypes.object,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
  organization: PropTypes.object,
};
