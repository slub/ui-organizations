import React from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { integrationConfig } from 'fixtures';
import { EmailView } from './EmailView';

const defaultProps = {
  ediEmail: integrationConfig.exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediEmail,
};

const renderEmailView = (props = defaultProps) => render(
  <EmailView
    {...props}
  />,
  { wrapper: MemoryRouter },
);

describe('EmailView', () => {
  it('should render EmailView', () => {
    renderEmailView();

    expect(screen.getByText('ui-organizations.integration.email')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.ediEmail.emailFrom)).toBeInTheDocument();
  });

  it('should render EmailView with empty data', () => {
    renderEmailView({ ediEmail: {} });

    expect(screen.getByText('ui-organizations.integration.email')).toBeInTheDocument();
  });
});
