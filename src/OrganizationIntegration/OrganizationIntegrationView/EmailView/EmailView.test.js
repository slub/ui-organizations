import { MemoryRouter } from 'react-router';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { integrationConfig } from 'fixtures';
import { useEmailTemplate } from '../../../common/hooks';
import { EmailView } from './EmailView';

jest.mock('../../../common/hooks', () => ({
  useEmailTemplate: jest.fn(),
}));

const { ediEmail } = integrationConfig.exportTypeSpecificParameters.vendorEdiOrdersExportConfig;
const TEMPLATE = { id: ediEmail.emailTemplate, name: 'Order email' };

const renderEmailView = (props = { ediEmail }) => render(
  <EmailView {...props} />,
  { wrapper: MemoryRouter },
);

describe('EmailView', () => {
  beforeEach(() => {
    useEmailTemplate.mockReturnValue({ template: TEMPLATE });
  });

  it('should render sender, recipient, BCC and the template name', () => {
    renderEmailView();

    expect(screen.getByText('ui-organizations.integration.email')).toBeInTheDocument();
    expect(screen.getByText(ediEmail.emailFrom)).toBeInTheDocument();
    expect(screen.getByText(ediEmail.emailTo)).toBeInTheDocument();
    expect(screen.getByText(ediEmail.emailBcc.join(', '))).toBeInTheDocument();
    expect(screen.getByText(TEMPLATE.name)).toBeInTheDocument();
  });

  it('should fall back to the template id while the name is unknown', () => {
    useEmailTemplate.mockReturnValue({ template: undefined });

    renderEmailView();

    expect(screen.getByText(ediEmail.emailTemplate)).toBeInTheDocument();
  });

  it('should render without email data', () => {
    useEmailTemplate.mockReturnValue({ template: undefined });

    renderEmailView({ ediEmail: {} });

    expect(screen.getByText('ui-organizations.integration.email')).toBeInTheDocument();
    expect(useEmailTemplate).toHaveBeenCalledWith(undefined);
  });
});
