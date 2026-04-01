import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  useHistory,
  useLocation,
} from 'react-router-dom';

import {
  LoadingPane,
  useIntegrationConfigs,
  useOrganization,
  useShowCallout,
} from '@folio/stripes-acq-components';

import {
  useAcqMethods,
  useIntegrationConfigMutation,
} from '../../common/hooks';
import {
  CONNECTION_MODES,
  EDI_CODE_TYPES,
  EXPORT_TYPES,
  FILE_FORMAT,
  FTP_TYPES,
  INTEGRATION_TYPE,
  TRANSMISSION_METHOD,
  TRANSMISSION_MODES,
} from '../constants';
import { OrganizationIntegrationForm } from '../OrganizationIntegrationForm';
import {
  buildAvailableAccounts,
  findDefaultIntegration,
  getDefaultEdiNamingConvention,
} from '../utils';

// should be removed after lotus release
const buildInitialValues = (organization, withMigration) => {
  const edi = withMigration ? organization?.edi || {} : {};

  return {
    schedulePeriod: 'NONE',
    type: EXPORT_TYPES.claims,
    exportTypeSpecificParameters: {
      vendorEdiOrdersExportConfig: {
        vendorId: organization?.id,
        integrationType: INTEGRATION_TYPE.claiming,
        transmissionMethod: TRANSMISSION_METHOD.fileDownLoad,
        fileFormat: FILE_FORMAT.csv,
        ediConfig: {
          vendorEdiCode: edi.vendorEdiCode,
          vendorEdiType: edi.vendorEdiType || EDI_CODE_TYPES[0].value,
          libEdiCode: edi.libEdiCode,
          libEdiType: edi.libEdiType || EDI_CODE_TYPES[0].value,
          ediNamingConvention: getDefaultEdiNamingConvention(),
          sendAccountNumber: edi.sendAcctNum,
          supportInvoice: edi.supportInvoice,
          supportOrder: edi.supportOrder,
          notes: edi.notes,
        },
        ediFtp: {
          ...(edi.ediFtp || {}),
          ftpFormat: edi.ediFtp?.ftpFormat || FTP_TYPES[0].value,
          ftpMode: edi.ediFtp?.ftpMode || TRANSMISSION_MODES[0].value,
          ftpConnMode: edi.ediFtp?.ftpConnMode || CONNECTION_MODES[0].value,
        },
      },
    },
  };
};

export const OrganizationIntegrationCreate = ({ orgId }) => {
  const location = useLocation();
  const history = useHistory();
  const sendCallout = useShowCallout();

  const { organization, isLoading } = useOrganization(orgId);
  const { acqMethods, isLoading: isAcqMethodsLoading } = useAcqMethods();
  const { integrationConfigs, isLoading: isIntegrationsLoading } = useIntegrationConfigs({ organizationId: orgId });

  const closeForm = () => {
    history.push({
      pathname: `/organizations/view/${organization.id}`,
      search: location.search,
    });
  };

  const { mutateIntegrationConfig } = useIntegrationConfigMutation({
    onSuccess: () => {
      sendCallout({
        message: <FormattedMessage id="ui-organizations.integration.message.save.success" />,
      });
      closeForm();
    },
    onError: () => {
      sendCallout({
        message: <FormattedMessage id="ui-organizations.integration.message.save.error" />,
        type: 'error',
      });
    },
  });

  const initialValues = useMemo(() => {
    return buildInitialValues(organization, !integrationConfigs.length);
  }, [organization, integrationConfigs]);

  if (isLoading || isIntegrationsLoading || isAcqMethodsLoading) {
    return (
      <LoadingPane
        id="integration-create"
        onClose={closeForm}
      />
    );
  }

  return (
    <OrganizationIntegrationForm
      acqMethods={acqMethods}
      accounts={buildAvailableAccounts(organization, integrationConfigs)}
      defaultIntegration={findDefaultIntegration(integrationConfigs)}
      initialValues={initialValues}
      onSubmit={mutateIntegrationConfig}
      onClose={closeForm}
      organizationEmails={organization?.emails}
      paneTitle={<FormattedMessage id="ui-organizations.integration.create.paneTitle" />}
    />
  );
};

OrganizationIntegrationCreate.propTypes = {
  orgId: PropTypes.string,
};
