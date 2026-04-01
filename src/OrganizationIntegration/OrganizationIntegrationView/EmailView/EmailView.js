import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';
import { useCategories } from '@folio/stripes-acq-components';

import { RECIPIENT_PRIMARY_EMAIL } from '../../constants';

export const EmailView = ({ ediEmail = {} }) => {
  const { categories } = useCategories();

  const recipientLabel = useMemo(() => {
    if (!ediEmail.recipient) return '-';

    if (ediEmail.recipient === RECIPIENT_PRIMARY_EMAIL) {
      return <FormattedMessage id="ui-organizations.integration.email.recipient.primaryEmail" />;
    }

    const category = categories.find(c => c.id === ediEmail.recipient);

    return category?.value || ediEmail.recipient;
  }, [ediEmail.recipient, categories]);

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
            value={recipientLabel}
          />
        </Col>
        <Col
          data-test-email-template
          xs={6}
          md={3}
        >
          <KeyValue
            label={<FormattedMessage id="ui-organizations.integration.email.emailTemplate" />}
            value={ediEmail.emailTemplate}
          />
        </Col>
      </Row>
    </Accordion>
  );
};

EmailView.propTypes = {
  ediEmail: PropTypes.object,
};
