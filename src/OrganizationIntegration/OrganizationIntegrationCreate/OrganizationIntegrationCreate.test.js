import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';

import {
  useIntegrationConfigs,
  useOrganization,
} from '@folio/stripes-acq-components';

import { organization } from 'fixtures';
import { history, location } from '../../../test/jest/routerMocks';

import { useIntegrationConfigMutation } from '../../common/hooks';

import { OrganizationIntegrationForm } from '../OrganizationIntegrationForm';
import { OrganizationIntegrationCreate } from './OrganizationIntegrationCreate';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useHistory: jest.fn(),
  useLocation: jest.fn(),
}));
jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useIntegrationConfigs: jest.fn().mockReturnValue({ integrationConfigs: [], isFetching: false }),
  useOrganization: jest.fn(),
}));
jest.mock('../../common/hooks', () => ({
  useAcqMethods: jest.fn().mockReturnValue({ acqMethods: [], isLoading: false }),
  useIntegrationConfigMutation: jest.fn(),
}));
jest.mock('../OrganizationIntegrationForm', () => ({
  OrganizationIntegrationForm: jest.fn().mockReturnValue('OrganizationIntegrationForm'),
}));

const defaultProps = {
  orgId: 'orgId',
};
const renderOrganizationIntegrationCreate = (props = defaultProps) => render(
  <OrganizationIntegrationCreate {...props} />,
);

describe('OrganizationIntegrationCreate', () => {
  beforeEach(() => {
    useHistory.mockClear().mockReturnValue(history);
    useLocation.mockClear().mockReturnValue(location);

    useOrganization.mockClear().mockReturnValue({ organization, isLoading: false });
    useIntegrationConfigMutation.mockClear().mockReturnValue({ });

    OrganizationIntegrationForm.mockClear();
  });

  it('should display OrganizationIntegrationForm', async () => {
    renderOrganizationIntegrationCreate();

    await screen.findByText('OrganizationIntegrationForm');

    expect(screen.getByText('OrganizationIntegrationForm')).toBeDefined();
  });

  it('should show the loading pane while integration configs are fetching', () => {
    useIntegrationConfigs.mockReturnValueOnce({ integrationConfigs: [], isFetching: true });

    renderOrganizationIntegrationCreate();

    expect(screen.queryByText('OrganizationIntegrationForm')).not.toBeInTheDocument();
  });

  it('should redirect to org details when form is closed', async () => {
    const pushMock = jest.fn();

    useHistory.mockClear().mockReturnValue({ ...history, push: pushMock });
    renderOrganizationIntegrationCreate();

    await screen.findByText('OrganizationIntegrationForm');

    OrganizationIntegrationForm.mock.calls[0][0].onClose();

    expect(pushMock).toHaveBeenCalled();
  });

  it('should save integration', async () => {
    const saveIntegrationConfigMock = jest.fn();

    useIntegrationConfigMutation.mockClear().mockReturnValue({ mutateIntegrationConfig: saveIntegrationConfigMock });
    renderOrganizationIntegrationCreate();

    await screen.findByText('OrganizationIntegrationForm');

    OrganizationIntegrationForm.mock.calls[0][0].onSubmit({});

    expect(saveIntegrationConfigMock).toHaveBeenCalled();
  });
});
