import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

import { FormattedMessage } from 'react-intl';
import {
  useHistory,
  MemoryRouter,
} from 'react-router-dom';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { queryHelpers } from '@folio/jest-config-stripes/testing-library/dom';
import user from '@folio/jest-config-stripes/testing-library/user-event';

import {
  HasCommand,
  expandAllSections,
  collapseAllSections,
} from '@folio/stripes/components';

import { ORGANIZATIONS_ROUTE } from '../../common/constants';
import {
  EDI_CODE_TYPES,
  FTP_TYPES,
  TRANSMISSION_MODES,
  CONNECTION_MODES,
  EXPORT_TYPES,
  INTEGRATION_TYPE,
  TRANSMISSION_METHOD,
} from '../constants';
import OrganizationIntegrationForm from './OrganizationIntegrationForm';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
}));
jest.mock('@folio/stripes-components/lib/Commander', () => ({
  HasCommand: jest.fn(({ children }) => <div>{children}</div>),
  expandAllSections: jest.fn(),
  collapseAllSections: jest.fn(),
}));
// eslint-disable-next-line react/prop-types
jest.mock('@folio/stripes-components/lib/AutoSuggest', () => (props) => <input {...props.input} />);

const queryAllByClass = queryHelpers.queryAllByAttribute.bind(null, 'class');

const initialValues = {
  schedulePeriod: 'NONE',
  type: 'EDIFACT_ORDERS_EXPORT',
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      vendorId: 'orgId',
      integrationType: INTEGRATION_TYPE.ordering,
      ediConfig: {
        accountNoList: [],
        defaultAcquisitionMethods: [],
        vendorEdiType: EDI_CODE_TYPES[0].value,
        libEdiType: EDI_CODE_TYPES[0].value,
      },
      editFtp: {
        ftpFormat: FTP_TYPES[0].value,
        ftpMode: TRANSMISSION_MODES[0].value,
        ftpConnMode: CONNECTION_MODES[0].value,
      },
    },
  },
};

const ACCOUNT_NO_LIST_PATH = 'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.ediConfig.accountNoList';
const IN_USE_WARNING = 'ui-organizations.integration.edi.accountNumbers.inUseWarning';

const buildInitialValues = (accountNoList) => set(cloneDeep(initialValues), ACCOUNT_NO_LIST_PATH, accountNoList);

const buildOtherIntegration = (type, accountNoList) => ({
  id: 'other-integration-id',
  type,
  exportTypeSpecificParameters: {
    vendorEdiOrdersExportConfig: {
      configName: 'Other integration',
      ediConfig: { accountNoList },
    },
  },
});

const defaultProps = {
  acqMethods: [],
  organization: { accounts: [{ accountNo: '123' }, { accountNo: '456' }] },
  integrationConfigs: [],
  defaultIntegration: undefined,
  onSubmit: jest.fn(),
  initialValues,
  onClose: jest.fn(),
  paneTitle: 'Create integration',
};

const renderOrganizationIntegrationForm = (props = {}) => render(
  <OrganizationIntegrationForm
    {...defaultProps}
    {...props}
  />,
  { wrapper: MemoryRouter },
);

describe('OrganizationIntegrationForm', () => {
  beforeEach(() => {
    global.document.createRange = global.document.originalCreateRange;
  });

  afterEach(() => {
    global.document.createRange = global.document.mockCreateRange;
  });

  it('should render correct form structure', () => {
    const { container, asFragment } = renderOrganizationIntegrationForm();

    container.querySelector('#org-integration-form-accordion-set').removeAttribute('aria-multiselectable');

    expect(asFragment()).toMatchSnapshot();
  });

  it('should hide scheduling details for claiming integration', async () => {
    renderOrganizationIntegrationForm();

    expect(screen.getByText('ui-organizations.integration.scheduling')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'ui-organizations.integration.info.integrationType' }), INTEGRATION_TYPE.claiming);

    expect(screen.queryByText('ui-organizations.integration.scheduling')).not.toBeInTheDocument();
  });

  it('should disable file format (but not transmission method) for ordering+FTP', async () => {
    const clonedInitialValues = cloneDeep(initialValues);

    set(
      clonedInitialValues,
      [
        'exportTypeSpecificParameters',
        'vendorEdiOrdersExportConfig',
        'integrationType',
      ],
      INTEGRATION_TYPE.claiming,
    );

    renderOrganizationIntegrationForm({ initialValues: clonedInitialValues });

    expect(screen.getByRole('combobox', { name: 'ui-organizations.integration.info.transmissionMethod' })).not.toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'ui-organizations.integration.info.fileFormat' })).not.toBeDisabled();

    await user.selectOptions(screen.getByRole('combobox', { name: 'ui-organizations.integration.info.integrationType' }), INTEGRATION_TYPE.ordering);

    // Transmission method is now selectable for ordering (to allow Email)
    expect(screen.getByRole('combobox', { name: 'ui-organizations.integration.info.transmissionMethod' })).not.toBeDisabled();
    // File format is disabled because ordering defaults to FTP+EDI
    expect(screen.getByRole('combobox', { name: 'ui-organizations.integration.info.fileFormat' })).toBeDisabled();
  });

  it('should render Email accordion when transmission method is Email', () => {
    const emailInitialValues = cloneDeep(initialValues);

    set(
      emailInitialValues,
      'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.transmissionMethod',
      TRANSMISSION_METHOD.email,
    );

    renderOrganizationIntegrationForm({ initialValues: emailInitialValues });

    expect(screen.getByText('ui-organizations.integration.email')).toBeInTheDocument();
  });

  describe('Account numbers', () => {
    const getAccountNumbersField = () => screen.getByRole('listbox', { name: 'ui-organizations.integration.edi.accountNumbers' });

    it('should not offer account numbers that another integration of the same type uses', () => {
      renderOrganizationIntegrationForm({
        integrationConfigs: [buildOtherIntegration(EXPORT_TYPES.edifactOrders, ['123'])],
      });

      expect(screen.queryByRole('option', { name: '123' })).not.toBeInTheDocument();
      expect(screen.getByRole('option', { name: '456' })).toBeInTheDocument();
    });

    it('should offer stored account numbers that another integration of the same type uses', () => {
      renderOrganizationIntegrationForm({
        initialValues: buildInitialValues(['123']),
        integrationConfigs: [buildOtherIntegration(EXPORT_TYPES.edifactOrders, ['123'])],
      });

      expect(screen.getByRole('option', { name: '123' }).selected).toBe(true);
    });

    it('should warn about selected account numbers that another integration of the same type uses', () => {
      renderOrganizationIntegrationForm({
        initialValues: buildInitialValues(['123']),
        integrationConfigs: [buildOtherIntegration(EXPORT_TYPES.edifactOrders, ['123'])],
      });

      expect(screen.getByText(IN_USE_WARNING)).toBeInTheDocument();
      expect(FormattedMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: IN_USE_WARNING,
          values: { accounts: '123 (Other integration)' },
        }),
        expect.anything(),
      );
    });

    it('should not warn when no other integration uses the selected account numbers', () => {
      renderOrganizationIntegrationForm({
        initialValues: buildInitialValues(['123']),
        integrationConfigs: [buildOtherIntegration(EXPORT_TYPES.edifactOrders, ['456'])],
      });

      expect(screen.queryByText(IN_USE_WARNING)).not.toBeInTheDocument();
    });

    it('should not warn when the other integration has another type', () => {
      renderOrganizationIntegrationForm({
        initialValues: buildInitialValues(['123']),
        integrationConfigs: [buildOtherIntegration(EXPORT_TYPES.claims, ['123'])],
      });

      expect(screen.queryByText(IN_USE_WARNING)).not.toBeInTheDocument();
    });

    it('should not warn for the default integration', () => {
      const defaultIntegrationValues = set(
        buildInitialValues(['123']),
        'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.isDefaultConfig',
        true,
      );

      renderOrganizationIntegrationForm({
        initialValues: defaultIntegrationValues,
        integrationConfigs: [buildOtherIntegration(EXPORT_TYPES.edifactOrders, ['123'])],
      });

      expect(screen.queryByText(IN_USE_WARNING)).not.toBeInTheDocument();
    });

    it('should not warn when the account number is deselected', async () => {
      renderOrganizationIntegrationForm({
        initialValues: buildInitialValues(['123']),
        integrationConfigs: [buildOtherIntegration(EXPORT_TYPES.edifactOrders, ['123'])],
      });

      await user.deselectOptions(getAccountNumbersField(), '123');

      expect(screen.queryByText(IN_USE_WARNING)).not.toBeInTheDocument();
      expect(screen.getByRole('option', { name: '123' })).toBeInTheDocument();
    });

    it('should keep a selected account number and warn when the integration type changes', async () => {
      renderOrganizationIntegrationForm({
        integrationConfigs: [buildOtherIntegration(EXPORT_TYPES.claims, ['123'])],
      });

      await user.selectOptions(getAccountNumbersField(), '123');

      expect(screen.queryByText(IN_USE_WARNING)).not.toBeInTheDocument();

      await user.selectOptions(screen.getByRole('combobox', { name: 'ui-organizations.integration.info.integrationType' }), INTEGRATION_TYPE.claiming);

      expect(screen.getByRole('option', { name: '123' }).selected).toBe(true);
      expect(screen.getByText(IN_USE_WARNING)).toBeInTheDocument();
    });
  });

  describe('Sections toggle', () => {
    it('should have all expanded sections by default', () => {
      const { container } = renderOrganizationIntegrationForm();

      const sections = queryAllByClass(container, 'defaultCollapseButton');

      expect(
        sections
          .filter(collapseButton => collapseButton.getAttribute('aria-expanded') === 'true')
          .length,
      ).toBe(sections.length);
    });

    it('should collapse sections when Collapse all button is pressed', async () => {
      const { container } = renderOrganizationIntegrationForm();

      await user.click(screen.getByText('stripes-components.collapseAll'));

      const sections = queryAllByClass(container, 'defaultCollapseButton');

      expect(
        sections
          .filter(collapseButton => collapseButton.getAttribute('aria-expanded') === 'false')
          .length,
      ).toBe(sections.length);
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
      renderOrganizationIntegrationForm();

      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'expandAllSections').handler();

      expect(expandAllSections).toHaveBeenCalled();
    });

    it('should call collapseAllSections when collapseAllSections shortcut is called', () => {
      collapseAllSections.mockClear();
      renderOrganizationIntegrationForm();

      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'collapseAllSections').handler();

      expect(collapseAllSections).toHaveBeenCalled();
    });

    it('should cancel form when cancel shortcut is called', () => {
      const pushMock = jest.fn();

      useHistory.mockClear().mockReturnValue({
        push: pushMock,
      });

      renderOrganizationIntegrationForm();
      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'cancel').handler();

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should navigate to list view when search shortcut is called', () => {
      const pushMock = jest.fn();

      useHistory.mockClear().mockReturnValue({
        push: pushMock,
      });

      renderOrganizationIntegrationForm();
      HasCommand.mock.calls[0][0].commands.find(c => c.name === 'search').handler();

      expect(pushMock).toHaveBeenCalledWith(ORGANIZATIONS_ROUTE);
    });
  });
});
