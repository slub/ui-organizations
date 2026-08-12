import React from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import { integrationConfig } from 'fixtures';
import SchedulingView from './SchedulingView';

const defaultProps = {
  ediSchedule: integrationConfig.exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule,
};

const renderSchedulingView = (props = defaultProps) => render(
  <SchedulingView
    {...props}
  />,
  { wrapper: MemoryRouter },
);

describe('SchedulingView', () => {
  it('should render SchedulingView', () => {
    renderSchedulingView();

    expect(screen.getByText('ui-organizations.integration.scheduling')).toBeInTheDocument();
    expect(screen.getByText('ui-organizations.integration.scheduling.scheduleEDI')).toBeInTheDocument();
    expect(screen.getByText('ui-organizations.integration.scheduling.schedulePeriod')).toBeInTheDocument();
  });

  it('should render email schedule label when transmission method is Email', () => {
    renderSchedulingView({
      ...defaultProps,
      isMethodEmail: true,
    });

    expect(screen.getByText('ui-organizations.integration.scheduling.scheduleEmail')).toBeInTheDocument();
    expect(screen.queryByText('ui-organizations.integration.scheduling.scheduleEDI')).toBeNull();
  });

  it('should render only Schedule Enabled checkbox', () => {
    renderSchedulingView({
      ediSchedule: {
        ...integrationConfig.exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediSchedule,
        enableScheduledExport: false,
      },
    });

    expect(screen.queryByText('ui-organizations.integration.scheduling.schedulePeriod')).toBeNull();
  });
});
