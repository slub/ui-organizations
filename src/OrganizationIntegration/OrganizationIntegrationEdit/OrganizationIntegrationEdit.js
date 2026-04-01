import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import {
  LoadingPane,
  useIntegrationConfigs,
  useOrganization,
  useShowCallout,
} from '@folio/stripes-acq-components';

import {
  useAcqMethods,
  useIntegrationConfig,
  useIntegrationConfigMutation,
} from '../../common/hooks';

import { buildAvailableAccounts, findDefaultIntegration } from '../utils';
import { OrganizationIntegrationForm } from '../OrganizationIntegrationForm';

export const OrganizationIntegrationEdit = ({ orgId }) => {
  const { id } = useParams();
  const location = useLocation();
  const history = useHistory();
  const sendCallout = useShowCallout();

  const { integrationConfig, isLoading } = useIntegrationConfig(id);
  const { organization, isLoading: isOrgLoading } = useOrganization(orgId);
  const { acqMethods, isLoading: isAcqMethodsLoading } = useAcqMethods();
  const { integrationConfigs, isLoading: isIntegrationsLoading } = useIntegrationConfigs({ organizationId: orgId });

  const closeForm = () => {
    history.push({
      pathname: `/organizations/${orgId}/integration/${id}/view`,
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

  if (isLoading || isOrgLoading || isIntegrationsLoading || isAcqMethodsLoading) {
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
      accounts={buildAvailableAccounts(organization, integrationConfigs, integrationConfig)}
      defaultIntegration={findDefaultIntegration(integrationConfigs, integrationConfig)}
      initialValues={integrationConfig}
      onSubmit={mutateIntegrationConfig}
      onClose={closeForm}
      organizationEmails={organization?.emails}
      paneTitle={
        <FormattedMessage
          id="ui-organizations.integration.edit.paneTitle"
          values={{ name: integrationConfig.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig?.configName }}
        />
      }
    />
  );
};

OrganizationIntegrationEdit.propTypes = {
  orgId: PropTypes.string,
};
