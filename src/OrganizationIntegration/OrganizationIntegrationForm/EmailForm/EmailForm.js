import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Field,
  useForm,
  useFormState,
} from 'react-final-form';
import { useQuery } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';
import {
  Accordion,
  Col,
  MessageBanner,
  Row,
  Select,
  TextField,
} from '@folio/stripes/components';
import { validateRequired } from '@folio/stripes-acq-components';

import {
  createConditionalValidator,
  isTransmissionMethodEmail,
} from '../../utils';

const TEMPLATES_API = 'templates';
const TEMPLATE_SCOPE = 'orders';

const EMAIL_SETTINGS_API = 'email/settings';
const SMTP_CONFIG_QUERY = 'scope==mod-email and key==smtp-configuration';

const ediEmailPath = 'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediEmail';

const validateEmailFrom = (...params) => {
  return createConditionalValidator(isTransmissionMethodEmail, validateRequired)(...params);
};

const validateRecipient = (...params) => {
  return createConditionalValidator(isTransmissionMethodEmail, validateRequired)(...params);
};

const validateEmailTemplate = (...params) => {
  return createConditionalValidator(isTransmissionMethodEmail, validateRequired)(...params);
};

export const EmailForm = ({ organizationEmails }) => {
  const intl = useIntl();
  const { change, getState } = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const ky = useOkapiKy();

  const formValues = getState()?.values;
  const isMethodEmail = isTransmissionMethodEmail(formValues);

  const currentEmailTo = values
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.ediEmail
    ?.emailTo;

  const currentEmailFrom = values
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.ediEmail
    ?.emailFrom;

  const currentEmailBcc = values
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.ediEmail
    ?.emailBcc;

  // Interim: single-select over the flat list of organization emails, Primary
  // pinned first and tagged. `emailTo` stays a single resolved address string
  // (mod-data-export-spring doesn't resolve tokens server-side). Once the
  // backend accepts multiple recipients, this becomes a multi-select over the
  // same list and `emailTo` becomes an array.
  const recipientOptions = useMemo(
    () => (organizationEmails || []).filter(e => e.value),
    [organizationEmails],
  );

  const primaryEmail = useMemo(
    () => recipientOptions.find(e => e.isPrimary),
    [recipientOptions],
  );

  const otherRecipientOptions = useMemo(
    () => recipientOptions.filter(e => e !== primaryEmail),
    [recipientOptions, primaryEmail],
  );

  const recipientAddresses = useMemo(
    () => new Set(recipientOptions.map(e => e.value)),
    [recipientOptions],
  );

  const hasNoRecipients = recipientAddresses.size === 0;

  const isRecipientOrphaned = Boolean(
    currentEmailTo
    && recipientAddresses.size > 0
    && !recipientAddresses.has(currentEmailTo),
  );

  const primaryLabel = intl.formatMessage({ id: 'ui-organizations.primaryItem' });

  // Build children array without falsy values — React.Children.map in stripes Select
  // iterates over false/null children and crashes on child.type
  const recipientSelectChildren = useMemo(() => {
    const opts = [<option key="empty" value="" aria-label="empty" />];

    if (isRecipientOrphaned && currentEmailTo) {
      opts.push(
        <option key="orphan" value={currentEmailTo}>
          {currentEmailTo}
        </option>,
      );
    }

    if (primaryEmail) {
      opts.push(
        <option key={primaryEmail.value} value={primaryEmail.value}>
          {`${primaryEmail.value} (${primaryLabel})`}
        </option>,
      );
    }

    otherRecipientOptions.forEach(email => {
      opts.push(
        <option key={email.value} value={email.value}>
          {email.value}
        </option>,
      );
    });

    return opts;
  }, [primaryEmail, otherRecipientOptions, isRecipientOrphaned, currentEmailTo, primaryLabel]);

  // Auto-select on mount: primary email's address if available, else the only option
  useEffect(() => {
    if (currentEmailTo) return;

    if (primaryEmail) {
      change(`${ediEmailPath}.emailTo`, primaryEmail.value);
    } else if (recipientOptions.length === 1) {
      change(`${ediEmailPath}.emailTo`, recipientOptions[0].value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: templatesData, isLoading: isTemplatesLoading } = useQuery(
    ['ui-organizations', 'email-templates', TEMPLATE_SCOPE],
    () => ky.get(TEMPLATES_API, {
      searchParams: { query: `scope=="${TEMPLATE_SCOPE}"` },
    }).json(),
    { enabled: isMethodEmail },
  );

  const { data: smtpData, isLoading: isSmtpLoading } = useQuery(
    ['ui-organizations', 'email-smtp-settings'],
    () => ky.get(EMAIL_SETTINGS_API, {
      searchParams: { query: SMTP_CONFIG_QUERY },
    }).json(),
    { enabled: isMethodEmail },
  );

  const smtpConfig = smtpData?.settings?.[0]?.value;

  // Dedupe by address; identities override `from` only if they add a name
  const senderOptions = useMemo(() => {
    if (!smtpConfig?.from) return [];

    const byAddress = new Map();

    byAddress.set(smtpConfig.from, { address: smtpConfig.from });
    (smtpConfig.identities || []).forEach(identity => {
      const existing = byAddress.get(identity.address);

      if (!existing || (identity.name && !existing.name)) {
        byAddress.set(identity.address, identity);
      }
    });

    return Array.from(byAddress.values());
  }, [smtpConfig]);

  const isEmailFromOrphaned = Boolean(
    isMethodEmail
    && currentEmailFrom
    && senderOptions.length > 0
    && !senderOptions.some(o => o.address === currentEmailFrom),
  );

  const defaultLabel = intl.formatMessage({ id: 'ui-organizations.integration.email.defaultLabel' });

  // No auto-select for sender: the user must pick consciously (Markus's
  // requirement, so admins treat this field differently from Recipient).
  const senderSelectChildren = useMemo(() => {
    if (senderOptions.length === 0) return null;

    const opts = [<option key="empty" value="" aria-label="empty" />];

    if (isEmailFromOrphaned && currentEmailFrom) {
      opts.push(
        <option key="orphan" value={currentEmailFrom}>
          {currentEmailFrom}
        </option>,
      );
    }

    const defaultAddress = smtpConfig?.from;
    const defaultOption = senderOptions.find(o => o.address === defaultAddress);
    const otherOptions = senderOptions.filter(o => o.address !== defaultAddress);

    if (defaultOption) {
      const label = defaultOption.name
        ? `${defaultOption.name} <${defaultOption.address}>`
        : defaultOption.address;

      opts.push(
        <option key="default" value={defaultOption.address}>
          {`${label} (${defaultLabel})`}
        </option>,
      );
    }

    otherOptions.forEach(o => {
      opts.push(
        <option key={o.address} value={o.address}>
          {o.name ? `${o.name} <${o.address}>` : o.address}
        </option>,
      );
    });

    return opts;
  }, [senderOptions, isEmailFromOrphaned, currentEmailFrom, smtpConfig, defaultLabel]);

  const hasNoSender = isMethodEmail && !isSmtpLoading && senderOptions.length === 0;

  const isEmailBccOrphaned = Boolean(
    isMethodEmail
    && currentEmailBcc
    && senderOptions.length > 0
    && !senderOptions.some(o => o.address === currentEmailBcc),
  );

  // Reactive Self-BCC correction: if the sender is changed to an address that's
  // currently set as BCC, clear the BCC. Otherwise the form would silently hold
  // an invalid combination (sender == BCC) until next save.
  useEffect(() => {
    if (currentEmailBcc && currentEmailBcc === currentEmailFrom) {
      change(`${ediEmailPath}.emailBcc`, '');
    }
  }, [currentEmailFrom, currentEmailBcc, change]);

  // The BCC select reuses senderOptions but excludes the currently selected
  // sender (no point in BCC'ing yourself). When nothing is left to pick, the
  // field stays visible but disabled so admins can see the feature exists.
  const bccSelectChildren = useMemo(() => {
    const opts = [<option key="empty" value="" aria-label="empty" />];

    if (isEmailBccOrphaned && currentEmailBcc) {
      opts.push(
        <option key="orphan" value={currentEmailBcc}>
          {currentEmailBcc}
        </option>,
      );
    }

    const availableSenders = senderOptions.filter(o => o.address !== currentEmailFrom);
    const defaultAddress = smtpConfig?.from;
    const defaultOption = availableSenders.find(o => o.address === defaultAddress);
    const otherOptions = availableSenders.filter(o => o.address !== defaultAddress);

    if (defaultOption) {
      const label = defaultOption.name
        ? `${defaultOption.name} <${defaultOption.address}>`
        : defaultOption.address;

      opts.push(
        <option key="default" value={defaultOption.address}>
          {`${label} (${defaultLabel})`}
        </option>,
      );
    }

    otherOptions.forEach(o => {
      opts.push(
        <option key={o.address} value={o.address}>
          {o.name ? `${o.name} <${o.address}>` : o.address}
        </option>,
      );
    });

    return opts;
  }, [senderOptions, currentEmailFrom, isEmailBccOrphaned, currentEmailBcc, smtpConfig, defaultLabel]);

  const isBccSelectable = (
    isEmailBccOrphaned
    || senderOptions.some(o => o.address !== currentEmailFrom)
  );

  const templateOptions = useMemo(() => {
    const options = [{ value: '', label: '' }];
    const templates = templatesData?.templates || [];

    return options.concat(templates.map(t => ({ value: t.id, label: t.name })));
  }, [templatesData]);

  return (
    <Accordion
      id="email"
      label={<FormattedMessage id="ui-organizations.integration.email" />}
    >
      {hasNoRecipients && (
        <MessageBanner type="warning">
          <FormattedMessage id="ui-organizations.integration.email.recipient.noRecipientsWarning" />
        </MessageBanner>
      )}
      {isRecipientOrphaned && (
        <MessageBanner type="warning">
          <FormattedMessage id="ui-organizations.integration.email.recipient.orphanedWarning" />
        </MessageBanner>
      )}
      {hasNoSender && (
        <MessageBanner type="error">
          <FormattedMessage id="ui-organizations.integration.email.senderAddress.noSenderError" />
        </MessageBanner>
      )}
      {isEmailFromOrphaned && (
        <MessageBanner type="warning">
          <FormattedMessage id="ui-organizations.integration.email.senderAddress.orphanedWarning" />
        </MessageBanner>
      )}
      {isEmailBccOrphaned && (
        <MessageBanner type="warning">
          <FormattedMessage id="ui-organizations.integration.email.bcc.orphanedWarning" />
        </MessageBanner>
      )}
      <Row>
        <Col xs={3}>
          {senderOptions.length > 0 ? (
            <Field
              label={<FormattedMessage id="ui-organizations.integration.email.senderAddress" />}
              name={`${ediEmailPath}.emailFrom`}
              component={Select}
              fullWidth
              required={isMethodEmail}
              validate={validateEmailFrom}
              validateFields={[]}
            >
              {senderSelectChildren}
            </Field>
          ) : (
            <Field
              label={<FormattedMessage id="ui-organizations.integration.email.senderAddress" />}
              name={`${ediEmailPath}.emailFrom`}
              type="email"
              component={TextField}
              disabled
              fullWidth
              required={isMethodEmail}
              validate={validateEmailFrom}
              validateFields={[]}
            />
          )}
        </Col>
        <Col xs={3}>
          <Field
            label={<FormattedMessage id="ui-organizations.integration.email.recipient" />}
            name={`${ediEmailPath}.emailTo`}
            component={Select}
            fullWidth
            required={isMethodEmail}
            validate={validateRecipient}
            validateFields={[]}
          >
            {recipientSelectChildren}
          </Field>
        </Col>
        <Col xs={3}>
          <Field
            label={<FormattedMessage id="ui-organizations.integration.email.bcc" />}
            name={`${ediEmailPath}.emailBcc`}
            component={Select}
            disabled={!isBccSelectable}
            fullWidth
            validateFields={[]}
          >
            {bccSelectChildren}
          </Field>
        </Col>
        <Col xs={3}>
          <Field
            label={<FormattedMessage id="ui-organizations.integration.email.emailTemplate" />}
            name={`${ediEmailPath}.emailTemplate`}
            component={Select}
            dataOptions={templateOptions}
            disabled={isTemplatesLoading}
            fullWidth
            required={isMethodEmail}
            validate={validateEmailTemplate}
            validateFields={[]}
          />
        </Col>
      </Row>
    </Accordion>
  );
};

EmailForm.propTypes = {
  organizationEmails: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    isPrimary: PropTypes.bool,
  })),
};

EmailForm.defaultProps = {
  organizationEmails: [],
};
