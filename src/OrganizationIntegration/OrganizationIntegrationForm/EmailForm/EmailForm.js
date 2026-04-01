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
import { useCategories, validateRequired } from '@folio/stripes-acq-components';

import { RECIPIENT_PRIMARY_EMAIL } from '../../constants';
import {
  createConditionalValidator,
  isTransmissionMethodEmail,
} from '../../utils';

const TEMPLATES_API = 'templates';
const TEMPLATE_SCOPE = 'orders';

const ediEmailPath = 'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediEmail';

const validateEmailFrom = (...params) => {
  return createConditionalValidator(isTransmissionMethodEmail, validateRequired)(...params);
};

const validateRecipient = (...params) => {
  return createConditionalValidator(isTransmissionMethodEmail, validateRequired)(...params);
};

export const EmailForm = ({ organizationEmails }) => {
  const intl = useIntl();
  const { change, getState } = useForm();
  const { values } = useFormState({ subscription: { values: true } });
  const ky = useOkapiKy();

  const formValues = getState()?.values;
  const isMethodEmail = isTransmissionMethodEmail(formValues);

  const currentRecipient = values
    ?.exportTypeSpecificParameters
    ?.vendorEdiOrdersExportConfig
    ?.ediEmail
    ?.recipient;

  const { categories } = useCategories();

  const orgCategoryIds = useMemo(() => {
    if (!organizationEmails?.length) return new Set();

    return new Set(organizationEmails.flatMap(e => e.categories || []));
  }, [organizationEmails]);

  const hasPrimaryEmail = useMemo(
    () => Boolean(organizationEmails?.some(e => e.isPrimary)),
    [organizationEmails],
  );

  const categoryOptions = useMemo(
    () => categories
      .filter(c => orgCategoryIds.has(c.id))
      .map(c => ({ value: c.id, label: c.value })),
    [categories, orgCategoryIds],
  );

  const hasNoRecipients = !hasPrimaryEmail && categoryOptions.length === 0;

  const isRecipientOrphaned = Boolean(
    currentRecipient && (
      (currentRecipient === RECIPIENT_PRIMARY_EMAIL && !hasPrimaryEmail) ||
      (currentRecipient !== RECIPIENT_PRIMARY_EMAIL && !categoryOptions.some(c => c.value === currentRecipient))
    )
  );

  // Build children array without falsy values — React.Children.map in stripes Select
  // iterates over false/null children and crashes on child.type
  const recipientSelectChildren = useMemo(() => {
    const opts = [<option key="empty" value="" />];

    if (hasPrimaryEmail) {
      opts.push(
        <option key="primary" value={RECIPIENT_PRIMARY_EMAIL}>
          {intl.formatMessage({ id: 'ui-organizations.integration.email.recipient.primaryEmail' })}
        </option>
      );
    }

    if (categoryOptions.length > 0) {
      opts.push(
        <optgroup
          key="categories"
          label={`── ${intl.formatMessage({ id: 'ui-organizations.integration.email.recipient.categoriesGroup' })} ──────────────`}
        >
          {categoryOptions.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </optgroup>
      );
    }

    return opts;
  }, [hasPrimaryEmail, categoryOptions, intl]);

  // Auto-select on mount: primary email if available, else only category option
  useEffect(() => {
    if (currentRecipient) return;

    if (hasPrimaryEmail) {
      change(`${ediEmailPath}.recipient`, RECIPIENT_PRIMARY_EMAIL);
    } else if (categoryOptions.length === 1) {
      change(`${ediEmailPath}.recipient`, categoryOptions[0].value);
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
      <Row>
        <Col xs={4}>
          <Field
            label={<FormattedMessage id="ui-organizations.integration.email.senderAddress" />}
            name={`${ediEmailPath}.emailFrom`}
            type="email"
            component={TextField}
            fullWidth
            required={isMethodEmail}
            validate={validateEmailFrom}
            validateFields={[]}
          />
        </Col>
        <Col xs={4}>
          <Field
            label={<FormattedMessage id="ui-organizations.integration.email.recipient" />}
            name={`${ediEmailPath}.recipient`}
            component={Select}
            fullWidth
            required={isMethodEmail}
            validate={validateRecipient}
            validateFields={[]}
          >
            {recipientSelectChildren}
          </Field>
        </Col>
        <Col xs={4}>
          <Field
            label={<FormattedMessage id="ui-organizations.integration.email.emailTemplate" />}
            name={`${ediEmailPath}.emailTemplate`}
            component={Select}
            dataOptions={templateOptions}
            disabled={isTemplatesLoading}
            fullWidth
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
    categories: PropTypes.arrayOf(PropTypes.string),
  })),
};

EmailForm.defaultProps = {
  organizationEmails: [],
};
