import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { MessageBanner } from '@folio/stripes/components';

import { getAcquisitionMethodsInUseMessage } from '../utils';

import css from '../AccountNumbersInUseBanner/AccountNumbersInUseBanner.css';

// Warns when another claiming integration of the vendor already covers one of the chosen
// acquisition methods on the same transmission method. Saving is still allowed.
export const AcquisitionMethodsInUseBanner = ({ acqMethods, integrationConfigs, integrationConfig }) => {
  const acquisitionMethods = getAcquisitionMethodsInUseMessage(integrationConfigs, integrationConfig, acqMethods);

  if (!acquisitionMethods) return null;

  return (
    <div className={css.marginBottomGutter}>
      <MessageBanner type="warning">
        <FormattedMessage
          id="ui-organizations.integration.edi.defaultAcquisitionMethods.inUseWarning"
          values={{ acquisitionMethods }}
        />
      </MessageBanner>
    </div>
  );
};

AcquisitionMethodsInUseBanner.propTypes = {
  acqMethods: PropTypes.arrayOf(PropTypes.object),
  integrationConfig: PropTypes.object,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
};
