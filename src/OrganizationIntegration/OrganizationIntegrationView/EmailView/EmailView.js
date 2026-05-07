import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useQuery } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';
import {
  Accordion,
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';

const TEMPLATES_API = 'templates';

export const EmailView = ({ ediEmail = {} }) => {
  const ky = useOkapiKy();

  const { data: templateData } = useQuery(
    ['ui-organizations', 'email-template', ediEmail.emailTemplate],
    () => ky.get(`${TEMPLATES_API}/${ediEmail.emailTemplate}`).json(),
    { enabled: Boolean(ediEmail.emailTemplate) },
  );

  const templateName = templateData?.name || ediEmail.emailTemplate;

  return (
    <Accordion
      id="email"
      label={<FormattedMessage id="ui-organizations.integration.email" />}
    >
      <Row>
        <Col
          data-test-sender-address
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.email.senderAddress" />}
            value={ediEmail.emailFrom}
          />
        </Col>
        <Col
          data-test-recipient
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.email.recipient" />}
            value={ediEmail.emailTo || '-'}
          />
        </Col>
        <Col
          data-test-bcc
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.email.bcc" />}
            value={ediEmail.emailBcc || '-'}
          />
        </Col>
        <Col
          data-test-email-template
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.email.emailTemplate" />}
            value={templateName}
          />
        </Col>
      </Row>
    </Accordion>
  );
};

EmailView.propTypes = {
  ediEmail: PropTypes.object,
};
