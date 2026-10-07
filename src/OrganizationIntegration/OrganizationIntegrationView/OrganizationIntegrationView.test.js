import {
  MemoryRouter,
  useHistory,
  useParams,
} from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { queryHelpers } from '@folio/jest-config-stripes/testing-library/dom';
import user from '@folio/jest-config-stripes/testing-library/user-event';

import {
  HasCommand,
  expandAllSections,
  collapseAllSections,
} from '@folio/stripes/components';
import {
  useIntegrationConfigs,
  useOrganization,
} from '@folio/stripes-acq-components';

import { integrationConfig } from 'fixtures';
import { ORGANIZATIONS_ROUTE } from '../../common/constants';
import { EXPORT_TYPES } from '../constants';
import {
  useIntegrationConfig,
  useIntegrationConfigMutation,
} from '../../common/hooks';
import OrganizationIntegrationView from './OrganizationIntegrationView';

import { getDuplicateTimestamp } from '../utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock('@folio/stripes-components/lib/NoValue', () => {
  return () => <span>NoValue</span>;
});
jest.mock('@folio/stripes-components/lib/Commander', () => ({
  HasCommand: jest.fn(({ children }) => <div>{children}</div>),
  expandAllSections: jest.fn(),
  collapseAllSections: jest.fn(),
}));
jest.mock('@folio/stripes-acq-components', () => ({
  ...jest.requireActual('@folio/stripes-acq-components'),
  useIntegrationConfigs: jest.fn().mockReturnValue({ integrationConfigs: [], isLoading: false }),
  useOrganization: jest.fn(),
}));
jest.mock('../../common/hooks', () => ({
  useAcqMethods: jest.fn().mockReturnValue({ acqMethods: [], isLoading: false }),
  useIntegrationConfig: jest.fn(),
  useIntegrationConfigMutation: jest.fn().mockReturnValue({ mutateIntegrationConfig: jest.fn() }),
}));
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  getDuplicateTimestamp: jest.fn(),
}));

const queryAllByClass = queryHelpers.queryAllByAttribute.bind(null, 'class');

const orgId = 'orgId';
const IN_USE_WARNING = 'ui-organizations.integration.edi.accountNumbers.inUseWarning';

const buildIntegration = (id, type, accountNoList, isDefaultConfig = false) => ({
  id,
  type,
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      configName: `${id} name`,
      isDefaultConfig,
      ediConfig: { accountNoList },
    },
  },
});
const defaultProps = { orgId };
const renderOrganizationIntegrationView = (props = defaultProps) => render(
  <OrganizationIntegrationView {...props} />,
  { wrapper: MemoryRouter },
);

describe('OrganizationIntegrationView', () => {
  const mutateIntegrationConfig = jest.fn();

  beforeEach(() => {
    getDuplicateTimestamp.mockReturnValue('01/01/2025');
    global.document.createRange = global.document.originalCreateRange;

    useParams.mockReturnValue({ id: integrationConfig.id });
    useOrganization.mockReturnValue({
      organization: { id: defaultProps.orgId, accounts: [] },
      isLoading: false,
    });
    useIntegrationConfigMutation.mockReturnValue({ mutateIntegrationConfig });
    useIntegrationConfig.mockReturnValue({ integrationConfig });
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.document.createRange = global.document.mockCreateRange;
  });

  it('should render correct view structure', () => {
    const { container, asFragment } = renderOrganizationIntegrationView();

    container.querySelector('#org-integration-view-accordion-set').removeAttribute('aria-multiselectable');

    expect(asFragment()).toMatchSnapshot();
  });

  describe('Account numbers', () => {
    const renderWithSibling = (current, sibling) => {
      useParams.mockReturnValue({ id: current.id });
      useIntegrationConfig.mockReturnValue({ integrationConfig: current });
      useIntegrationConfigs.mockReturnValue({ integrationConfigs: [current, sibling], isLoading: false });

      return renderOrganizationIntegrationView();
    };

    it('should warn about account numbers that another integration of the same type uses', () => {
      renderWithSibling(
        buildIntegration('current', EXPORT_TYPES.edifactOrders, ['123']),
        buildIntegration('sibling', EXPORT_TYPES.edifactOrders, ['123']),
      );

      expect(screen.getByText(IN_USE_WARNING)).toBeInTheDocument();
    });

    it('should not warn when the other integration has another type', () => {
      renderWithSibling(
        buildIntegration('current', EXPORT_TYPES.edifactOrders, ['123']),
        buildIntegration('sibling', EXPORT_TYPES.claims, ['123']),
      );

      expect(screen.queryByText(IN_USE_WARNING)).not.toBeInTheDocument();
    });

    it('should not warn for the default integration', () => {
      renderWithSibling(
        buildIntegration('current', EXPORT_TYPES.edifactOrders, ['123'], true),
        buildIntegration('sibling', EXPORT_TYPES.edifactOrders, ['123']),
      );

      expect(screen.queryByText(IN_USE_WARNING)).not.toBeInTheDocument();
    });
  });

  describe('Sections toggle', () => {
    it('should have all expanded sections by default', () => {
      const { container } = renderOrganizationIntegrationView();

      const sections = queryAllByClass(container, 'defaultCollapseButton');

      expect(
        sections
          .filter(collapseButton => collapseButton.getAttribute('aria-expanded') === 'true')
          .length,
      ).toBe(sections.length);
    });

    it('should collapse sections when Collapse all button is pressed', async () => {
      const { container } = renderOrganizationIntegrationView();

      await user.click(screen.getByText('stripes-components.collapseAll'));

      const sections = queryAllByClass(container, 'defaultCollapseButton');

      expect(
        sections
          .filter(collapseButton => collapseButton.getAttribute('aria-expanded') === 'false')
          .length,
      ).toBe(sections.length);
    });
  });

  describe('Actions', () => {
    it('should open remove confirmation', async () => {
      renderOrganizationIntegrationView();

      await user.click(screen.getByTestId('remove-integration-action'));

      expect(screen.getByText('ui-organizations.integration.confirmation.heading')).toBeInTheDocument();
    });

    it('should open form', async () => {
      const pushMock = jest.fn();

      useHistory.mockClear().mockReturnValue({
        push: pushMock,
      });

      renderOrganizationIntegrationView();

      await user.click(screen.getByTestId('edit-integration-action'));

      expect(pushMock).toHaveBeenCalledWith({
        pathname: `/organizations/${orgId}/integration/${integrationConfig.id}/edit`,
        search: '',
      });
    });

    it('should duplicate integration config', async () => {
      const pushMock = jest.fn();

      useHistory.mockReturnValue({ push: pushMock });

      renderOrganizationIntegrationView();

      await user.click(screen.getByTestId('duplicate-integration-action'));
      await user.click(screen.getByText('ui-organizations.integration.confirmation.confirm'));

      expect(mutateIntegrationConfig).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith({
        pathname: `/organizations/view/${orgId}`,
        search: '',
      });
    });
  });

  describe('Shortcuts', () => {
    beforeEach(() => {
      HasCommand.mockClear();
      expandAllSections.mockClear();
      collapseAllSections.mockClear();
    });

    it('should call expandAllSections when expandAllSections shortcut is called', async () => {
      expandAllSections.mockClear();
      renderOrganizationIntegrationView();

      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'expandAllSections').handler();

      expect(expandAllSections).toHaveBeenCalled();
    });

    it('should call collapseAllSections when collapseAllSections shortcut is called', () => {
      collapseAllSections.mockClear();
      renderOrganizationIntegrationView();

      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'collapseAllSections').handler();

      expect(collapseAllSections).toHaveBeenCalled();
    });

    it('should navigate to form when edit shortcut is called', () => {
      const pushMock = jest.fn();

      useHistory.mockClear().mockReturnValue({
        push: pushMock,
      });

      renderOrganizationIntegrationView();
      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'edit').handler();

      expect(pushMock).toHaveBeenCalledWith({
        pathname: `/organizations/${orgId}/integration/${integrationConfig.id}/edit`,
        search: '',
      });
    });

    it('should navigate to list view when search shortcut is called', () => {
      const pushMock = jest.fn();

      useHistory.mockClear().mockReturnValue({
        push: pushMock,
      });

      renderOrganizationIntegrationView();
      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'search').handler();

      expect(pushMock).toHaveBeenCalledWith(ORGANIZATIONS_ROUTE);
    });
  });

  describe('Loading pane', () => {
    it('should render loading pane', () => {
      useIntegrationConfig.mockClear().mockReturnValue({ isLoading: true });
      renderOrganizationIntegrationView();

      expect(screen.getByTestId('integration-view-loading')).toBeInTheDocument();
    });
  });
});
