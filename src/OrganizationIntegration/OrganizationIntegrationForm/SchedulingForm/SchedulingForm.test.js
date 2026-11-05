import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import stripesFinalForm from '@folio/stripes/final-form';

import { TRANSMISSION_METHOD } from '../../constants';
import { SchedulingForm } from './SchedulingForm';

const TestForm = stripesFinalForm({})(() => (
  <form>
    <SchedulingForm />
  </form>
));

const buildInitialValues = (transmissionMethod) => ({
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      transmissionMethod,
      ediSchedule: { enableScheduledExport: false },
    },
  },
});

const renderSchedulingForm = (transmissionMethod) => render(
  <TestForm
    onSubmit={jest.fn()}
    initialValues={buildInitialValues(transmissionMethod)}
  />,
  { wrapper: MemoryRouter },
);

describe('SchedulingForm', () => {
  it('should label the checkbox "Schedule email" for email integrations', () => {
    renderSchedulingForm(TRANSMISSION_METHOD.email);

    expect(screen.getByText('ui-organizations.integration.scheduling.scheduleEmail')).toBeInTheDocument();
    expect(screen.queryByText('ui-organizations.integration.scheduling.scheduleEDI')).not.toBeInTheDocument();
  });

  it('should label the checkbox "Schedule EDI" for other integrations', () => {
    renderSchedulingForm(TRANSMISSION_METHOD.ftp);

    expect(screen.getByText('ui-organizations.integration.scheduling.scheduleEDI')).toBeInTheDocument();
    expect(screen.queryByText('ui-organizations.integration.scheduling.scheduleEmail')).not.toBeInTheDocument();
  });
});
