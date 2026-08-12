import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import omit from 'lodash/omit';
import set from 'lodash/set';
import PropTypes from 'prop-types';
import {
  useCallback,
  useRef,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import {
  useHistory,
  useParams,
  useLocation,
} from 'react-router-dom';

import { AppIcon } from '@folio/stripes/core';
import {
  AccordionSet,
  AccordionStatus,
  Button,
  checkScope,
  Col,
  collapseAllSections,
  ExpandAllButton,
  expandAllSections,
  HasCommand,
  Pane,
  Row,
  MenuSection,
  Icon,
  ConfirmationModal,
} from '@folio/stripes/components';

import {
  useShowCallout,
  LoadingPane,
  handleKeyCommand,
  useModalToggle,
} from '@folio/stripes-acq-components';

import { ORGANIZATIONS_ROUTE } from '../../common/constants';
import {
  useAcqMethods,
  useIntegrationConfig,
  useIntegrationConfigMutation,
} from '../../common/hooks';
import {
  getDuplicateTimestamp,
  isClaimingIntegration,
  isFileFormatEDI,
  isTransmissionMethodFTP,
  isTransmissionMethodEmail,
} from '../utils';
import { IntegrationInfoView } from './IntegrationInfoView';
import { EdiView } from './EdiView';
import { FtpView } from './FtpView';
import { EmailView } from './EmailView';
import { SchedulingView } from './SchedulingView';

const CONFIG_NAME_PATH = 'exportTypeSpecificParameters.vendorEdiOrdersExportConfig.configName';

const OrganizationIntegrationView = ({ orgId }) => {
  const intl = useIntl();
  const history = useHistory();
  const location = useLocation();
  const accordionStatusRef = useRef();
  const { id } = useParams();
  const showCallout = useShowCallout();

  const [isDuplicateConfirmation, toggleDuplicateConfirmation] = useModalToggle();
  const [isRemoveConfirmation, toggleRemoveConfirmation] = useModalToggle();

  const { integrationConfig, isLoading } = useIntegrationConfig(id);
  const { acqMethods, isLoading: isAcqMethodsLoading } = useAcqMethods();

  const configName = get(integrationConfig, CONFIG_NAME_PATH);
  const isClaimingType = isClaimingIntegration(integrationConfig);
  const isMethodFTP = isTransmissionMethodFTP(integrationConfig);
  const isMethodEmail = isTransmissionMethodEmail(integrationConfig);
  const isFormatEDI = isFileFormatEDI(integrationConfig);

  const onEdit = useCallback(
    () => {
      history.push({
        pathname: `/organizations/${orgId}/integration/${id}/edit`,
        search: location.search,
      });
    },
    [history, id, location.search, orgId],
  );

  const onClose = useCallback(
    () => {
      history.push({
        pathname: `/organizations/view/${orgId}`,
        search: location.search,
      });
    },
    [history, location.search, orgId],
  );

  const {
    mutateIntegrationConfig: createIntegrationConfig,
  } = useIntegrationConfigMutation({ method: 'post' });

  const { mutateIntegrationConfig } = useIntegrationConfigMutation({
    method: 'delete',
    onSuccess: () => {
      showCallout({
        message: <FormattedMessage id="ui-organizations.integration.message.delete.success" />,
      });
      onClose();
    },
    onError: () => {
      showCallout({
        message: <FormattedMessage id="ui-organizations.integration.message.delete.error" />,
        type: 'error',
      });
    },
  });

  const onDuplicate = useCallback(async () => {
    toggleDuplicateConfirmation();

    const integrationConfigCloned = omit(cloneDeep(integrationConfig), 'id');
    const configNameCloned = `${configName} (${getDuplicateTimestamp({ intl })})`;

    set(
      integrationConfigCloned,
      CONFIG_NAME_PATH,
      intl.formatMessage(
        { id: 'ui-organizations.integrationDetails.duplicate.name' },
        { term: configNameCloned },
      ),
    );

    try {
      await createIntegrationConfig(integrationConfigCloned);

      showCallout({
        messageId: 'ui-organizations.integrationDetails.duplicate.success',
        values: { term: configNameCloned },
      });
      history.push({
        pathname: `/organizations/view/${orgId}`,
        search: location.search,
      });
    } catch {
      showCallout({
        messageId: 'ui-organizations.integrationDetails.duplicate.error',
        type: 'error',
      });
    }
  }, [
    configName,
    createIntegrationConfig,
    history,
    integrationConfig,
    intl,
    location.search,
    orgId,
    showCallout,
    toggleDuplicateConfirmation,
  ]);

  const onRemove = useCallback(
    () => mutateIntegrationConfig(integrationConfig),
    [integrationConfig, mutateIntegrationConfig],
  );

  // eslint-disable-next-line react/prop-types
  const renderActionMenu = ({ onToggle }) => (
    <MenuSection id="integration-actions">
      <Button
        buttonStyle="dropdownItem"
        data-testid="edit-integration-action"
        onClick={onEdit}
      >
        <Icon
          size="small"
          icon="edit"
        >
          <FormattedMessage id="ui-organizations.view.edit" />
        </Icon>
      </Button>

      <Button
        buttonStyle="dropdownItem"
        data-testid="duplicate-integration-action"
        onClick={() => {
          onToggle();
          toggleDuplicateConfirmation();
        }}
      >
        <Icon
          size="small"
          icon="duplicate"
        >
          <FormattedMessage id="ui-organizations.view.duplicate" />
        </Icon>
      </Button>

      <Button
        buttonStyle="dropdownItem"
        data-testid="remove-integration-action"
        onClick={() => {
          onToggle();
          toggleRemoveConfirmation();
        }}
      >
        <Icon
          size="small"
          icon="trash"
        >
          <FormattedMessage id="ui-organizations.view.delete" />
        </Icon>
      </Button>
    </MenuSection>
  );

  const shortcuts = [
    {
      name: 'search',
      handler: handleKeyCommand(() => history.push(ORGANIZATIONS_ROUTE)),
    },
    {
      name: 'expandAllSections',
      handler: (e) => expandAllSections(e, accordionStatusRef),
    },
    {
      name: 'collapseAllSections',
      handler: (e) => collapseAllSections(e, accordionStatusRef),
    },
    {
      name: 'edit',
      handler: handleKeyCommand(onEdit),
    },
  ];

  if (isLoading || isAcqMethodsLoading) {
    return (
      <LoadingPane
        id="integration-view-loading"
        data-testid="integration-view-loading"
        onClose={onClose}
      />
    );
  }

  return (
    <HasCommand
      commands={shortcuts}
      isWithinScope={checkScope}
      scope={document.body}
    >
      <Pane
        appIcon={
          <AppIcon
            app="organizations"
            appIconKey="organizations"
          />
        }
        actionMenu={renderActionMenu}
        defaultWidth="fill"
        dismissible
        id="integration-view"
        onClose={onClose}
        paneTitle={configName}
      >
        <Row>
          <Col
            xs={12}
            md={8}
            mdOffset={2}
          >
            <AccordionStatus ref={accordionStatusRef}>
              <Row end="xs">
                <Col xs={12}>
                  <ExpandAllButton />
                </Col>
              </Row>
              <AccordionSet id="org-integration-view-accordion-set">
                <IntegrationInfoView
                  integrationConfig={integrationConfig
                    ?.exportTypeSpecificParameters
                    ?.vendorEdiOrdersExportConfig
                  }
                  acqMethods={acqMethods}
                />
                {(!isMethodEmail || isFormatEDI) && (
                  <EdiView
                    vendorEdiOrdersExportConfig={integrationConfig
                      ?.exportTypeSpecificParameters
                      ?.vendorEdiOrdersExportConfig
                    }
                  />
                )}

                {isMethodFTP && (
                  <FtpView ediFtp={integrationConfig
                    ?.exportTypeSpecificParameters
                    ?.vendorEdiOrdersExportConfig
                    ?.ediFtp}
                  />
                )}

                {isMethodEmail && (
                  <EmailView ediEmail={integrationConfig
                    ?.exportTypeSpecificParameters
                    ?.vendorEdiOrdersExportConfig
                    ?.ediEmail}
                  />
                )}

                {(!isClaimingType || isMethodEmail) && (
                  <SchedulingView
                    ediSchedule={integrationConfig
                      ?.exportTypeSpecificParameters
                      ?.vendorEdiOrdersExportConfig
                      ?.ediSchedule}
                    isMethodEmail={isMethodEmail}
                  />
                )}
              </AccordionSet>
            </AccordionStatus>
          </Col>
        </Row>

        {isDuplicateConfirmation && (
          <ConfirmationModal
            id="duplicate-integration-modal"
            confirmLabel={<FormattedMessage id="ui-organizations.integration.confirmation.confirm" />}
            heading={<FormattedMessage id="ui-organizations.integrationDetails.duplicate.confirmModal.heading" />}
            message={(
              <FormattedMessage
                id="ui-organizations.integrationDetails.duplicate.confirmModal.message"
                values={{ term: configName }}
              />
            )}
            onCancel={toggleDuplicateConfirmation}
            onConfirm={onDuplicate}
            open
          />
        )}

        {isRemoveConfirmation && (
          <ConfirmationModal
            id="integration-remove-confirmation"
            confirmLabel={<FormattedMessage id="ui-organizations.integration.confirmation.confirm" />}
            heading={<FormattedMessage id="ui-organizations.integration.confirmation.heading" />}
            message={<FormattedMessage id="ui-organizations.integration.confirmation.message" />}
            onCancel={toggleRemoveConfirmation}
            onConfirm={onRemove}
            open
          />
        )}
      </Pane>
    </HasCommand>
  );
};

OrganizationIntegrationView.propTypes = {
  orgId: PropTypes.string.isRequired,
};

export default OrganizationIntegrationView;
