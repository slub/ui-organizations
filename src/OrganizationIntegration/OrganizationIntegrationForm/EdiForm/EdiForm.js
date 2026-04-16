import {
  Field,
  useForm,
} from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Checkbox,
  Col,
  InfoPopover,
  Row,
  Select,
  TextArea,
  TextField,
} from '@folio/stripes/components';

import {
  EDI_CODE_TYPES,
  EDI_NAMING_TOKENS,
} from '../../constants';
import {
  isFileFormatEDI,
  validateLibraryEDICode,
  validateVendorEDICode,
} from '../../utils';

export const EdiForm = () => {
  const { getState } = useForm();

  const isFormatEDI = isFileFormatEDI(getState()?.values);

  return (
    <Accordion
      id="edi"
      label={<FormattedMessage id="ui-organizations.integration.edi" />}
    >
      <Row>
        <Col
          data-test-vendor-edi-code
          xs={6}
          md={3}
        >
          <Field
            component={TextField}
            fullWidth
            id="vendorEdiCode"
            label={<FormattedMessage id="ui-organizations.integration.edi.vendorEDICode" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.vendorEdiCode"
            required={isFormatEDI}
            validate={validateVendorEDICode}
          />
        </Col>

        <Col
          data-test-vendor-edi-type
          xs={6}
          md={3}
        >
          <Field
            label={<FormattedMessage id="ui-organizations.integration.edi.vendorEDIType" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.vendorEdiType"
            component={Select}
            dataOptions={EDI_CODE_TYPES}
            fullWidth
          />
        </Col>

        <Col
          data-test-library-edi-code
          xs={6}
          md={3}
        >
          <Field
            component={TextField}
            fullWidth
            id="libEdiCode"
            label={<FormattedMessage id="ui-organizations.integration.edi.libraryEDICode" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.libEdiCode"
            required={isFormatEDI}
            validate={validateLibraryEDICode}
          />
        </Col>

        <Col
          data-test-library-edi-type
          xs={6}
          md={3}
        >
          <Field
            component={Select}
            dataOptions={EDI_CODE_TYPES}
            fullWidth
            label={<FormattedMessage id="ui-organizations.integration.edi.libraryEDIType" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.libEdiType"
          />
        </Col>

        <Col
          data-test-edi-naming-convention
          xs={6}
          md={3}
        >
          <Field
            disabled
            component={TextField}
            fullWidth
            id="ediNamingConvention"
            label={(
              <>
                <FormattedMessage id="ui-organizations.integration.edi.ediNamingConvention" />
                <InfoPopover content={(
                  <>
                    <FormattedMessage id="ui-organizations.comingSoon" />
                    <FormattedMessage
                      id="ui-organizations.integration.edi.ediNamingConvention.info"
                      values={{ tokens: <p>{Object.values(EDI_NAMING_TOKENS).join(', ')}</p> }}
                      tagName="p"
                    />
                  </>
                  )}
                />
              </>
            )}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.ediNamingConvention"
          />
        </Col>

        <Col
          data-test-send-acc-number
          xs={6}
          md={3}
        >
          <Field
            label={<FormattedMessage id="ui-organizations.integration.edi.sendAccountNumber" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.sendAccountNumber"
            type="checkbox"
            component={Checkbox}
            vertical
          />
        </Col>

        <Col
          data-test-notifications
          xs={6}
          md={3}
        >
          <FormattedMessage id="ui-organizations.integration.edi.receiveNotifications" />
          <Field
            label={<FormattedMessage id="ui-organizations.integration.edi.orders" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.supportOrder"
            component={Checkbox}
            type="checkbox"
          />
          <Field
            label={<FormattedMessage id="ui-organizations.integration.edi.invoices" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.supportInvoice"
            component={Checkbox}
            type="checkbox"
          />
        </Col>

        <Col
          data-test-notes
          xs={6}
          md={3}
        >
          <Field
            label={<FormattedMessage id="ui-organizations.integration.edi.notes" />}
            name="exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.notes"
            component={TextArea}
            fullWidth
          />
        </Col>
      </Row>
    </Accordion>
  );
};
