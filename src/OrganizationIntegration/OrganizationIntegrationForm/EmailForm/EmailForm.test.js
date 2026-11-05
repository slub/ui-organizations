import { MemoryRouter } from 'react-router-dom';
import {
  render,
  screen,
  waitFor,
  within,
} from '@folio/jest-config-stripes/testing-library/react';
import user from '@folio/jest-config-stripes/testing-library/user-event';

import stripesFinalForm from '@folio/stripes/final-form';

import {
  useEmailTemplates,
  useSmtpConfiguration,
} from '../../../common/hooks';
import { TRANSMISSION_METHOD } from '../../constants';
import { EmailForm } from './EmailForm';

jest.mock('../../../common/hooks', () => ({
  useEmailTemplates: jest.fn(),
  useSmtpConfiguration: jest.fn(),
}));

// No form element, like the integration form: the browser must not validate the required
// selects itself, final-form does.
const TestForm = stripesFinalForm({})(({ handleSubmit, organizationEmails }) => (
  <div>
    <EmailForm organizationEmails={organizationEmails} />
    <button
      type="button"
      onClick={handleSubmit}
    >
      Save
    </button>
  </div>
));

const SMTP_CONFIGURATION = {
  from: 'orders@library.org',
  identities: [{ address: 'acq@library.org', name: 'Acquisitions' }],
};
const ACTIVE_TEMPLATE = { id: 'active-id', name: 'Active template', active: true };
const INACTIVE_TEMPLATE = { id: 'inactive-id', name: 'Old template', active: false };
const ORGANIZATION_EMAILS = [
  { value: 'primary@vendor.org', isPrimary: true },
  { value: 'other@vendor.org', isPrimary: false },
];

const LABELS = {
  sender: 'ui-organizations.integration.email.senderAddress',
  recipient: 'ui-organizations.integration.email.recipient',
  template: 'ui-organizations.integration.email.emailTemplate',
};
const REQUIRED_ERROR = 'stripes-acq-components.validation.required';

const buildInitialValues = (ediEmail = {}) => ({
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      transmissionMethod: TRANSMISSION_METHOD.email,
      ediEmail,
    },
  },
});

const getSelect = (name) => screen.getByRole('combobox', { name });
const getOptionValues = (name) => within(getSelect(name)).getAllByRole('option').map(({ value }) => value);

const renderEmailForm = ({
  ediEmail,
  organizationEmails = ORGANIZATION_EMAILS,
  onSubmit = jest.fn(),
} = {}) => render(
  <TestForm
    onSubmit={onSubmit}
    initialValues={buildInitialValues(ediEmail)}
    organizationEmails={organizationEmails}
  />,
  { wrapper: MemoryRouter },
);

describe('EmailForm', () => {
  beforeEach(() => {
    global.document.createRange = global.document.originalCreateRange;
    useSmtpConfiguration.mockReturnValue({ smtpConfiguration: SMTP_CONFIGURATION, isLoading: false });
    useEmailTemplates.mockReturnValue({
      templates: [ACTIVE_TEMPLATE, INACTIVE_TEMPLATE],
      isLoading: false,
      isLoaded: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.document.createRange = global.document.mockCreateRange;
  });

  describe('Sender', () => {
    it('should offer the default address and the identities from the email settings', () => {
      renderEmailForm();

      expect(getOptionValues(LABELS.sender)).toEqual(['', 'orders@library.org', 'acq@library.org']);
      expect(screen.getByText('orders@library.org (ui-organizations.integration.email.defaultLabel)')).toBeInTheDocument();
      expect(screen.getByText('Acquisitions <acq@library.org>')).toBeInTheDocument();
    });

    it('should show an error and disable the select without configured sender', () => {
      useSmtpConfiguration.mockReturnValue({ smtpConfiguration: undefined, isLoading: false });

      renderEmailForm();

      expect(screen.getByText('ui-organizations.integration.email.senderAddress.noSenderError')).toBeInTheDocument();
      expect(getSelect(LABELS.sender)).toBeDisabled();
    });

    it('should keep a stored sender that is no longer configured and warn about it', () => {
      renderEmailForm({ ediEmail: { emailFrom: 'gone@library.org' } });

      expect(screen.getByText('ui-organizations.integration.email.senderAddress.orphanedWarning')).toBeInTheDocument();
      expect(getSelect(LABELS.sender).value).toBe('gone@library.org');
    });
  });

  describe('Recipient', () => {
    it('should preselect the primary email of the organization', () => {
      renderEmailForm();

      expect(getSelect(LABELS.recipient).value).toBe('primary@vendor.org');
      expect(getOptionValues(LABELS.recipient)).toEqual(['', 'primary@vendor.org', 'other@vendor.org']);
      expect(screen.getByText('primary@vendor.org (ui-organizations.primaryItem)')).toBeInTheDocument();
    });

    it('should warn when the organization has no email address', () => {
      renderEmailForm({ organizationEmails: [] });

      expect(screen.getByText('ui-organizations.integration.email.recipient.noRecipientsWarning')).toBeInTheDocument();
      expect(getOptionValues(LABELS.recipient)).toEqual(['']);
    });

    it('should keep a stored recipient that is no longer configured and warn about it', () => {
      renderEmailForm({ ediEmail: { emailTo: 'gone@vendor.org' } });

      expect(screen.getByText('ui-organizations.integration.email.recipient.orphanedWarning')).toBeInTheDocument();
      expect(getSelect(LABELS.recipient).value).toBe('gone@vendor.org');
    });

    it('should treat a stored recipient as orphaned when the organization has no email address', () => {
      renderEmailForm({ ediEmail: { emailTo: 'gone@vendor.org' }, organizationEmails: [] });

      expect(screen.getByText('ui-organizations.integration.email.recipient.orphanedWarning')).toBeInTheDocument();
      expect(getOptionValues(LABELS.recipient)).toEqual(['', 'gone@vendor.org']);
    });
  });

  describe('BCC', () => {
    it('should warn about a stored BCC address that is no longer configured', () => {
      renderEmailForm({ ediEmail: { emailBcc: ['gone@library.org'] } });

      expect(screen.getByText('ui-organizations.integration.email.bcc.orphanedWarning')).toBeInTheDocument();
    });

    it('should drop a BCC address that is the selected sender', async () => {
      const onSubmit = jest.fn();

      renderEmailForm({
        ediEmail: {
          emailFrom: 'acq@library.org',
          emailBcc: ['acq@library.org', 'other@vendor.org'],
          emailTemplate: ACTIVE_TEMPLATE.id,
        },
        onSubmit,
      });

      await waitFor(() => expect(screen.queryByText('acq@library.org')).not.toBeInTheDocument());
      expect(screen.queryByText('ui-organizations.integration.email.bcc.orphanedWarning')).not.toBeInTheDocument();

      await user.click(screen.getByText('Save'));

      const { ediEmail } = onSubmit.mock.calls[0][0].exportTypeSpecificParameters.vendorEdiOrdersExportConfig;

      expect(ediEmail.emailBcc).toEqual(['other@vendor.org']);
      expect(ediEmail.emailTo).toBe('primary@vendor.org');
    });
  });

  describe('Template', () => {
    it('should offer active templates only', () => {
      renderEmailForm();

      expect(getOptionValues(LABELS.template)).toEqual(['', ACTIVE_TEMPLATE.id]);
    });

    it('should keep a stored inactive template and mark it', () => {
      renderEmailForm({ ediEmail: { emailTemplate: INACTIVE_TEMPLATE.id } });

      expect(getOptionValues(LABELS.template)).toEqual(['', ACTIVE_TEMPLATE.id, INACTIVE_TEMPLATE.id]);
      expect(screen.getByText('Old template (ui-organizations.integration.email.emailTemplate.inactiveLabel)')).toBeInTheDocument();
      expect(screen.getByText('ui-organizations.integration.email.emailTemplate.inactiveWarning')).toBeInTheDocument();
    });

    it('should block saving when the stored template no longer exists', async () => {
      const onSubmit = jest.fn();

      renderEmailForm({
        ediEmail: { emailFrom: 'orders@library.org', emailTemplate: 'deleted-id' },
        onSubmit,
      });

      expect(screen.getByText('ui-organizations.integration.email.emailTemplate.deletedWarning')).toBeInTheDocument();

      await user.click(screen.getByText('Save'));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('ui-organizations.integration.email.emailTemplate.deletedError')).toBeInTheDocument();
    });

    it('should block saving when the templates arrive after the form was rendered', async () => {
      const onSubmit = jest.fn();

      useEmailTemplates.mockReturnValue({ templates: [], isLoading: true, isLoaded: false });

      const { rerender } = renderEmailForm({
        ediEmail: { emailFrom: 'orders@library.org', emailTemplate: 'deleted-id' },
        onSubmit,
      });

      expect(screen.queryByText('ui-organizations.integration.email.emailTemplate.deletedWarning')).not.toBeInTheDocument();

      useEmailTemplates.mockReturnValue({ templates: [ACTIVE_TEMPLATE], isLoading: false, isLoaded: true });
      rerender(
        <TestForm
          onSubmit={onSubmit}
          initialValues={buildInitialValues({ emailFrom: 'orders@library.org', emailTemplate: 'deleted-id' })}
          organizationEmails={ORGANIZATION_EMAILS}
        />,
      );

      expect(screen.getByText('ui-organizations.integration.email.emailTemplate.deletedWarning')).toBeInTheDocument();

      await user.click(screen.getByText('Save'));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('ui-organizations.integration.email.emailTemplate.deletedError')).toBeInTheDocument();
    });
  });

  it('should require sender, recipient and template', async () => {
    const onSubmit = jest.fn();

    renderEmailForm({ organizationEmails: [], onSubmit });

    await user.click(screen.getByText('Save'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText(REQUIRED_ERROR)).toHaveLength(3);
  });
});
