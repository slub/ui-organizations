import { useCallback, useEffect, useMemo } from 'react';
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
  OptionSegment,
  Row,
  Select,
  TextField,
} from '@folio/stripes/components';
import { FieldMultiSelectionFinal, validateRequired } from '@folio/stripes-acq-components';

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

  // emailTo stays a single string by design, not an array: an order has
  // exactly one handler, and the field predates this feature.
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

  // No falsy children: stripes Select's React.Children.map crashes on child.type
  // if a child is false/null.
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

  // No auto-select for sender, unlike Recipient: must be picked deliberately.
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

  // BCC pool merges our identities (minus the chosen sender) with the
  // vendor's addresses (minus the chosen recipient); no default/primary
  // markers here, unlike Sender/Recipient.
  const allValidBccAddresses = useMemo(() => {
    const addresses = new Set(senderOptions.map(o => o.address));

    recipientOptions.forEach(e => addresses.add(e.value));

    return addresses;
  }, [senderOptions, recipientOptions]);

  const orphanedBccAddresses = useMemo(
    () => (currentEmailBcc || []).filter(addr => !allValidBccAddresses.has(addr)),
    [currentEmailBcc, allValidBccAddresses],
  );

  const isEmailBccOrphaned = isMethodEmail && orphanedBccAddresses.length > 0;

  // Drop a BCC address if it later becomes the sender or recipient, so the
  // form can't silently hold that invalid combination until save.
  useEffect(() => {
    if (!currentEmailBcc?.length) return;

    const filtered = currentEmailBcc.filter(
      addr => addr !== currentEmailFrom && addr !== currentEmailTo,
    );

    if (filtered.length !== currentEmailBcc.length) {
      change(`${ediEmailPath}.emailBcc`, filtered);
    }
  }, [currentEmailFrom, currentEmailTo, currentEmailBcc, change]);

  // Plain address strings, not {value, label}: MultiSelection's default
  // filter/formatter expect option.label, so filterBccOptions/formatBccOption
  // below read the option itself instead.
  const bccOptions = useMemo(() => {
    const seen = new Set();
    const addresses = [];

    const addAddress = (address) => {
      if (!address || seen.has(address)) return;
      seen.add(address);
      addresses.push(address);
    };

    orphanedBccAddresses.forEach(addAddress);
    senderOptions.forEach(o => { if (o.address !== currentEmailFrom) addAddress(o.address); });
    recipientOptions.forEach(e => { if (e.value !== currentEmailTo) addAddress(e.value); });

    return addresses;
  }, [orphanedBccAddresses, senderOptions, currentEmailFrom, recipientOptions, currentEmailTo]);

  const isBccSelectable = bccOptions.length > 0;

  const bccItemToString = useCallback(option => option || '', []);

  const formatBccOption = useCallback(({ option, searchTerm }) => (
    <OptionSegment searchTerm={searchTerm}>{option}</OptionSegment>
  ), []);

  const filterBccOptions = useCallback((filterText, list) => {
    const escapedFilterText = filterText?.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&');
    const filterRegExp = new RegExp(`^${escapedFilterText}`, 'i');
    const renderedItems = filterText ? list.filter(item => item.search(filterRegExp) !== -1) : list;
    const exactMatch = filterText ? renderedItems.filter(item => item === filterText).length === 1 : false;

    return { renderedItems, exactMatch };
  }, []);

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
          <FieldMultiSelectionFinal
            label={<FormattedMessage id="ui-organizations.integration.email.bcc" />}
            name={`${ediEmailPath}.emailBcc`}
            dataOptions={bccOptions}
            itemToString={bccItemToString}
            formatter={formatBccOption}
            filter={filterBccOptions}
            disabled={!isBccSelectable}
            validateFields={[]}
          />
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
