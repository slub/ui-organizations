import get from 'lodash/get';
import PropTypes from 'prop-types';
import {
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  Field,
  useForm,
  useFormState,
} from 'react-final-form';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  Accordion,
  Col,
  MessageBanner,
  OptionSegment,
  Row,
  Select,
} from '@folio/stripes/components';
import {
  FieldMultiSelectionFinal,
  validateRequired,
} from '@folio/stripes-acq-components';

import {
  useEmailTemplates,
  useSmtpConfiguration,
} from '../../../common/hooks';
import { getTemplateScope } from '../../utils';

const EDI_EMAIL_PATH = 'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediEmail';
const EMPTY_OPTION = { value: '', label: '' };

const formatSenderLabel = ({ name, address }) => (name ? `${name} <${address}>` : address);

export const EmailForm = ({ organizationEmails = [] }) => {
  const intl = useIntl();
  const { change } = useForm();
  const { values } = useFormState({ subscription: { values: true } });

  const {
    emailFrom: currentEmailFrom,
    emailTo: currentEmailTo,
    emailBcc: currentEmailBcc,
    emailTemplate: currentEmailTemplate,
  } = get(values, EDI_EMAIL_PATH) || {};

  const { smtpConfiguration, isLoading: isSmtpLoading } = useSmtpConfiguration();
  const {
    templates,
    isLoading: isTemplatesLoading,
    isLoaded: areTemplatesLoaded,
  } = useEmailTemplates(getTemplateScope(values)); // Ordering and claiming pick from different scopes.

  // Recipient: the organization's email addresses, the primary one first.
  const recipientEmails = useMemo(
    () => organizationEmails.filter(({ value }) => value),
    [organizationEmails],
  );
  const primaryEmail = useMemo(
    () => recipientEmails.find(({ isPrimary }) => isPrimary),
    [recipientEmails],
  );
  const hasNoRecipients = recipientEmails.length === 0;
  const isRecipientOrphaned = Boolean(
    currentEmailTo && !recipientEmails.some(({ value }) => value === currentEmailTo),
  );

  const recipientOptions = useMemo(() => {
    const primaryLabel = intl.formatMessage({ id: 'ui-organizations.primaryItem' });
    const options = [EMPTY_OPTION];

    if (isRecipientOrphaned) {
      options.push({ value: currentEmailTo, label: currentEmailTo });
    }

    if (primaryEmail) {
      options.push({ value: primaryEmail.value, label: `${primaryEmail.value} (${primaryLabel})` });
    }

    recipientEmails
      .filter((email) => email !== primaryEmail)
      .forEach(({ value }) => options.push({ value, label: value }));

    return options;
  }, [intl, isRecipientOrphaned, currentEmailTo, primaryEmail, recipientEmails]);

  useEffect(() => {
    if (currentEmailTo) return;

    if (primaryEmail) {
      change(`${EDI_EMAIL_PATH}.emailTo`, primaryEmail.value);
    } else if (recipientEmails.length === 1) {
      change(`${EDI_EMAIL_PATH}.emailTo`, recipientEmails[0].value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sender: the default address and the identities from the email settings.
  // An identity only replaces the plain default address when it adds a name.
  const senderIdentities = useMemo(() => {
    if (!smtpConfiguration?.from) return [];

    const byAddress = new Map([[smtpConfiguration.from, { address: smtpConfiguration.from }]]);

    (smtpConfiguration.identities || []).forEach((identity) => {
      const existing = byAddress.get(identity.address);

      if (!existing || (identity.name && !existing.name)) {
        byAddress.set(identity.address, identity);
      }
    });

    return Array.from(byAddress.values());
  }, [smtpConfiguration]);

  const hasNoSender = !isSmtpLoading && senderIdentities.length === 0;
  const isEmailFromOrphaned = Boolean(
    currentEmailFrom
    && !isSmtpLoading
    && !senderIdentities.some(({ address }) => address === currentEmailFrom),
  );

  const senderOptions = useMemo(() => {
    const defaultLabel = intl.formatMessage({ id: 'ui-organizations.integration.email.defaultLabel' });
    const options = [EMPTY_OPTION];

    if (isEmailFromOrphaned) {
      options.push({ value: currentEmailFrom, label: currentEmailFrom });
    }

    senderIdentities.forEach((identity) => {
      const label = formatSenderLabel(identity);

      options.push({
        value: identity.address,
        label: identity.address === smtpConfiguration.from ? `${label} (${defaultLabel})` : label,
      });
    });

    return options;
  }, [intl, isEmailFromOrphaned, currentEmailFrom, senderIdentities, smtpConfiguration]);

  // BCC: every sender and recipient address except the ones currently selected.
  const bccAddresses = useMemo(() => {
    const addresses = new Set([
      ...senderIdentities.map(({ address }) => address),
      ...recipientEmails.map(({ value }) => value),
    ]);

    addresses.delete(currentEmailFrom);
    addresses.delete(currentEmailTo);

    return Array.from(addresses);
  }, [senderIdentities, recipientEmails, currentEmailFrom, currentEmailTo]);

  // A removed address stays selectable so the user sees the warning instead of losing
  // the value silently; an address that became sender or recipient is dropped below.
  const orphanedBccAddresses = useMemo(
    () => (currentEmailBcc || []).filter(
      (address) => address !== currentEmailFrom && address !== currentEmailTo && !bccAddresses.includes(address),
    ),
    [currentEmailBcc, currentEmailFrom, currentEmailTo, bccAddresses],
  );
  const isEmailBccOrphaned = orphanedBccAddresses.length > 0;

  useEffect(() => {
    const kept = (currentEmailBcc || []).filter(
      (address) => address !== currentEmailFrom && address !== currentEmailTo,
    );

    if (kept.length !== (currentEmailBcc || []).length) {
      change(`${EDI_EMAIL_PATH}.emailBcc`, kept);
    }
  }, [currentEmailFrom, currentEmailTo, currentEmailBcc, change]);

  // Plain strings as options: MultiSelection's default filter and formatter expect option.label.
  const bccOptions = useMemo(
    () => [...orphanedBccAddresses, ...bccAddresses],
    [orphanedBccAddresses, bccAddresses],
  );

  const bccItemToString = useCallback((option) => option || '', []);

  const formatBccOption = useCallback(({ option, searchTerm }) => (
    <OptionSegment searchTerm={searchTerm}>{option}</OptionSegment>
  ), []);

  const filterBccOptions = useCallback((filterText, list) => {
    const search = filterText?.toLowerCase();
    const renderedItems = search ? list.filter((address) => address.toLowerCase().startsWith(search)) : list;
    const exactMatch = renderedItems.includes(filterText);

    return { renderedItems, exactMatch };
  }, []);

  // Template: active templates only; the stored one stays selectable while inactive and
  // blocks saving once it is deleted.
  const storedTemplate = templates.find(({ id }) => id === currentEmailTemplate);
  const isTemplateInactive = Boolean(storedTemplate && !storedTemplate.active);
  const isTemplateDeleted = Boolean(currentEmailTemplate && areTemplatesLoaded && !storedTemplate);

  const templateOptions = useMemo(() => {
    const inactiveLabel = intl.formatMessage({ id: 'ui-organizations.integration.email.emailTemplate.inactiveLabel' });

    return [
      EMPTY_OPTION,
      ...templates
        .filter(({ id, active }) => active || id === currentEmailTemplate)
        .map(({ id, name, active }) => ({ value: id, label: active ? name : `${name} (${inactiveLabel})` })),
    ];
  }, [intl, templates, currentEmailTemplate]);

  const validateEmailTemplate = useCallback((value) => {
    if (isTemplateDeleted) {
      return <FormattedMessage id="ui-organizations.integration.email.emailTemplate.deletedError" />;
    }

    return validateRequired(value);
  }, [isTemplateDeleted]);

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
      {isTemplateInactive && (
        <MessageBanner type="warning">
          <FormattedMessage id="ui-organizations.integration.email.emailTemplate.inactiveWarning" />
        </MessageBanner>
      )}
      {isTemplateDeleted && (
        <MessageBanner type="warning">
          <FormattedMessage id="ui-organizations.integration.email.emailTemplate.deletedWarning" />
        </MessageBanner>
      )}
      <Row>
        <Col xs={3}>
          <Field
            label={<FormattedMessage id="ui-organizations.integration.email.senderAddress" />}
            name={`${EDI_EMAIL_PATH}.emailFrom`}
            component={Select}
            dataOptions={senderOptions}
            disabled={hasNoSender}
            fullWidth
            required
            validate={validateRequired}
            validateFields={[]}
          />
        </Col>
        <Col xs={3}>
          <Field
            label={<FormattedMessage id="ui-organizations.integration.email.recipient" />}
            name={`${EDI_EMAIL_PATH}.emailTo`}
            component={Select}
            dataOptions={recipientOptions}
            fullWidth
            required
            validate={validateRequired}
            validateFields={[]}
          />
        </Col>
        <Col xs={3}>
          <FieldMultiSelectionFinal
            label={<FormattedMessage id="ui-organizations.integration.email.bcc" />}
            name={`${EDI_EMAIL_PATH}.emailBcc`}
            dataOptions={bccOptions}
            itemToString={bccItemToString}
            formatter={formatBccOption}
            filter={filterBccOptions}
            disabled={bccOptions.length === 0}
            validateFields={[]}
          />
        </Col>
        <Col xs={3}>
          {/* The key re-registers the field once the templates are loaded, so the validator runs again. */}
          <Field
            key={isTemplateDeleted ? 'deleted' : 'available'}
            label={<FormattedMessage id="ui-organizations.integration.email.emailTemplate" />}
            name={`${EDI_EMAIL_PATH}.emailTemplate`}
            component={Select}
            dataOptions={templateOptions}
            disabled={isTemplatesLoading}
            fullWidth
            required
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
