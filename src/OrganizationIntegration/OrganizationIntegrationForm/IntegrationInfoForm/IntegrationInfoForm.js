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
import {
  getAccountOptions,
  getFileFormatOptions,
  getIntegrationTypeOptions,
  getTransmissionMethodOptions,
  isFileFormatEDI,
  isOrderingIntegration,
  isTransmissionMethodEmail,
  isTransmissionMethodFTP,
  validateAccountNumbersField,
} from '../../utils';

export const IntegrationInfoForm = ({
  accounts,
  defaultIntegration,
}) => {
  const intl = useIntl();
  const {
    batch,
    change,
    getState,
  } = useForm();

  const formValues = getState()?.values;

  const isFormatEDI = isFileFormatEDI(formValues);
  const isOrderingType = isOrderingIntegration(formValues);
  const isMethodEmail = isTransmissionMethodEmail(formValues);
  const isMethodFTP = isTransmissionMethodFTP(formValues);

  const isDefaultConfig = formValues
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.isDefaultConfig;

  const accountOptions = useMemo(() => getAccountOptions(accounts), [accounts]);

  const integrationTypeOptions = useMemo(() => getIntegrationTypeOptions(intl), [intl]);
  const transmissionMethodOptions = useMemo(() => getTransmissionMethodOptions(intl), [intl]);
  // Ordering: only FTP and Email (no File download — original folio-org behavior)
  const orderingTransmissionMethodOptions = useMemo(
    () => transmissionMethodOptions.filter(o => o.value !== TRANSMISSION_METHOD.fileDownLoad),
    [transmissionMethodOptions],
  );
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
            dataOptions={isOrderingType ? orderingTransmissionMethodOptions : transmissionMethodOptions}
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
        {
          !isDefaultConfig && !isMethodEmail && (
            <Col
              data-test-edi-account-numbers
              xs={6}
              md={3}
            >
              <Field
                label={<FormattedMessage id="ui-organizations.integration.edi.accountNumbers" />}
                name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.accountNoList"
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
  accounts: PropTypes.arrayOf(PropTypes.string),
  defaultIntegration: PropTypes.object,
};
