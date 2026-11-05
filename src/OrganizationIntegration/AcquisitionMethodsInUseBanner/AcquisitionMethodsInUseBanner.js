import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { MessageBanner } from '@folio/stripes/components';

import {
  getAcquisitionMethodsInUseMessage,
  getRemainingAcqMethodsIntegrationNames,
} from '../utils';

import css from '../AccountNumbersInUseBanner/AccountNumbersInUseBanner.css';

// Warns when another claiming integration of the vendor on the same transmission method already covers
// one of the chosen acquisition methods, or the remaining ones. Saving is still allowed.
export const AcquisitionMethodsInUseBanner = ({
  acqMethods,
  coversRemainingAcqMethods = false,
  integrationConfigs,
  integrationConfig,
}) => {
  const integrations = coversRemainingAcqMethods
    ? getRemainingAcqMethodsIntegrationNames(integrationConfigs, integrationConfig).join(', ')
    : '';
  const acquisitionMethods = coversRemainingAcqMethods
    ? ''
    : getAcquisitionMethodsInUseMessage(integrationConfigs, integrationConfig, acqMethods);

  if (!integrations && !acquisitionMethods) return null;

  return (
    <div className={css.marginBottomGutter}>
      <MessageBanner type="warning">
        {integrations
          ? (
            <FormattedMessage
              id="ui-organizations.integration.info.acquisitionMethods.allRemaining.inUseWarning"
              values={{ integrations }}
            />
          )
          : (
            <FormattedMessage
              id="ui-organizations.integration.info.acquisitionMethods.inUseWarning"
              values={{ acquisitionMethods }}
            />
          )}
      </MessageBanner>
    </div>
  );
};

AcquisitionMethodsInUseBanner.propTypes = {
  acqMethods: PropTypes.arrayOf(PropTypes.object),
  coversRemainingAcqMethods: PropTypes.bool,
  integrationConfig: PropTypes.object,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
};
