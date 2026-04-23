import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Checkbox,
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';

import {
  INTEGRATION_TYPE,
  TRANSMISSION_METHOD,
} from '../../constants';

const IntegrationInfoView = ({
  integrationConfig = {},
  acqMethods = [],
}) => {
  const isDefaultConfig = integrationConfig?.isDefaultConfig;

  const defaultAcquisitionMethodsLabels = useMemo(() => {
    const defaultAcquisitionMethods = integrationConfig?.ediConfig?.defaultAcquisitionMethods || [];

    return acqMethods
      .filter(({ id }) => defaultAcquisitionMethods.includes(id))
      .map(({ value }) => value)
      .join(', ');
  }, [integrationConfig?.ediConfig?.defaultAcquisitionMethods, acqMethods]);

  const integrationType = useMemo(() => {
    const translationKey = Object.entries(INTEGRATION_TYPE).find(([, value]) => {
      return value === integrationConfig?.integrationType;
    })?.[0];

    return translationKey
      ? <FormattedMessage id={`ui-organizations.integration.info.integrationType.${translationKey}`} />
      : integrationConfig?.integrationType;
  }, [integrationConfig?.integrationType]);

  const transmissionMethod = useMemo(() => {
    const translationKey = Object.entries(TRANSMISSION_METHOD).find(([, value]) => {
      return value === integrationConfig?.transmissionMethod;
    })?.[0];

    return translationKey
      ? <FormattedMessage id={`ui-organizations.integration.info.transmissionMethod.${translationKey}`} />
      : integrationConfig?.transmissionMethod;
  }, [integrationConfig?.transmissionMethod]);

  return (
    <Accordion
      id="integrationInfo"
      label={<FormattedMessage id="ui-organizations.integration.info" />}
    >
      <Row>
        <Col xs={3}>
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.info.configName" />}
            value={integrationConfig.configName}
          />
        </Col>

        <Col xs={3}>
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.info.configDescription" />}
            value={integrationConfig.configDescription}
          />
        </Col>

        <Col xs={3}>
          <Checkbox
            label={<FormattedMessage id="ui-organizations.integration.info.isDefaultConfig" />}
            checked={integrationConfig.isDefaultConfig}
            vertical
            disabled
          />
        </Col>
      </Row>
      <Row>
        <Col
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.info.integrationType" />}
            value={integrationType}
          />
        </Col>

        <Col
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.info.transmissionMethod" />}
            value={transmissionMethod}
          />
        </Col>

        <Col
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.info.fileFormat" />}
            value={integrationConfig.fileFormat}
          />
        </Col>

        <Col
          data-test-edi-acq-methods
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.edi.defaultAcquisitionMethods" />}
            value={defaultAcquisitionMethodsLabels}
          />
        </Col>

        {
          !isDefaultConfig && (
            <Col
              data-test-edi-account-numbers
              xs={6}
              md={3}
            >
              <KeyValue
                label={<FormattedMessage id="ui-organizations.integration.edi.accountNumbers" />}
                value={integrationConfig.ediConfig?.accountNoList?.join(', ')}
              />
            </Col>
          )
        }
      </Row>
    </Accordion>
  );
};

IntegrationInfoView.propTypes = {
  integrationConfig: PropTypes.object,
  acqMethods: PropTypes.arrayOf(PropTypes.object),
};

export default IntegrationInfoView;
