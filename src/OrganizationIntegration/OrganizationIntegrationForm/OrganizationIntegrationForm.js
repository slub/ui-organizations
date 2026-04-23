import React, {
  useMemo,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import stripesForm from '@folio/stripes/final-form';
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
  PaneFooter,
  Row,
} from '@folio/stripes/components';

import {
  handleKeyCommand,
} from '@folio/stripes-acq-components';

import { ORGANIZATIONS_ROUTE } from '../../common/constants';
import {
  isClaimingIntegration,
  isFileFormatEDI,
  isTransmissionMethodFTP,
  isTransmissionMethodEmail,
} from '../utils';
import { IntegrationInfoForm } from './IntegrationInfoForm';
import { EdiForm } from './EdiForm';
import { FtpForm } from './FtpForm';
import { EmailForm } from './EmailForm';
import { SchedulingForm } from './SchedulingForm';

const OrganizationIntegrationForm = ({
  acqMethods,
  accounts,
  defaultIntegration,
  form: { getState },
  onClose,
  organizationEmails,
  paneTitle,
  handleSubmit,
  pristine,
  submitting,
}) => {
  const history = useHistory();
  const accordionStatusRef = useRef();
  const paneFooter = useMemo(
    () => {
      const end = (
        <Button
          id="clickable-save-contact-person-footer"
          type="submit"
          buttonStyle="primary mega"
          disabled={pristine || submitting}
          onClick={handleSubmit}
        >
          <FormattedMessage id="stripes-components.saveAndClose" />
        </Button>
      );

      const start = (
        <FormattedMessage id="ui-organizations.button.cancel">
          {(btnLabel) => (
            <Button
              id="clickable-close-contact-person-footer"
              buttonStyle="default mega"
              onClick={onClose}
            >
              {btnLabel}
            </Button>
          )}
        </FormattedMessage>
      );

      return (
        <PaneFooter
          renderStart={start}
          renderEnd={end}
        />
      );
    },
    [submitting, pristine, handleSubmit, onClose],
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
      name: 'cancel',
      shortcut: 'esc',
      handler: handleKeyCommand(onClose),
    },
    {
      name: 'save',
      handler: handleKeyCommand(handleSubmit, { disabled: pristine || submitting }),
    },
  ];

  const formValues = getState()?.values;
  const isClaimingType = isClaimingIntegration(formValues);
  const isMethodFTP = isTransmissionMethodFTP(formValues);
  const isMethodEmail = isTransmissionMethodEmail(formValues);
  const isFormatEDI = isFileFormatEDI(formValues);

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
        defaultWidth="fill"
        dismissible
        id="integration-form"
        footer={paneFooter}
        onClose={onClose}
        paneTitle={paneTitle}
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
              <AccordionSet id="org-integration-form-accordion-set">
                <IntegrationInfoForm
                  accounts={accounts}
                  acqMethods={acqMethods}
                  defaultIntegration={defaultIntegration}
                />

                {(!isMethodEmail || isFormatEDI) && <EdiForm />}

                {isMethodFTP && <FtpForm />}

                {isMethodEmail && <EmailForm organizationEmails={organizationEmails} />}

                {(!isClaimingType || isMethodEmail) && <SchedulingForm />}
              </AccordionSet>
            </AccordionStatus>
          </Col>
        </Row>
      </Pane>
    </HasCommand>
  );
};

OrganizationIntegrationForm.propTypes = {
  acqMethods: PropTypes.arrayOf(PropTypes.object),
  accounts: PropTypes.arrayOf(PropTypes.string),
  defaultIntegration: PropTypes.object,
  form: PropTypes.shape({
    getState: PropTypes.func.isRequired,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  organizationEmails: PropTypes.arrayOf(PropTypes.object),
  paneTitle: PropTypes.node.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default stripesForm({
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  navigationCheck: true,
  subscription: { values: true },
})(OrganizationIntegrationForm);
