import React from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { integrationConfig } from 'fixtures';
import IntegrationInfoView from './IntegrationInfoView';

const defaultProps = {
  integrationConfig: integrationConfig.exportTypeSpecificParameters.vendorEdiOrdersExportConfig,
};

const renderIntegrationInfoView = (props = defaultProps) => render(
  <IntegrationInfoView
    {...props}
  />,
  { wrapper: MemoryRouter },
);

describe('IntegrationInfoView', () => {
  it('should render IntegrationInfoView', () => {
    renderIntegrationInfoView();

    expect(screen.getByText('ui-organizations.integration.info')).toBeInTheDocument();
    expect(screen.getByText(defaultProps.integrationConfig.configName)).toBeInTheDocument();
  });

  it('should render the names of the acquisition methods', () => {
    renderIntegrationInfoView({
      integrationConfig: {
        ...defaultProps.integrationConfig,
        ediConfig: { defaultAcquisitionMethods: ['purchase-id'] },
      },
      acqMethods: [
        { id: 'purchase-id', value: 'Purchase' },
        { id: 'gift-id', value: 'Gift' },
      ],
    });

    expect(screen.getByText('ui-organizations.integration.info.acquisitionMethods')).toBeInTheDocument();
    expect(screen.getByText('Purchase')).toBeInTheDocument();
    expect(screen.queryByText('Gift')).not.toBeInTheDocument();
  });
});
