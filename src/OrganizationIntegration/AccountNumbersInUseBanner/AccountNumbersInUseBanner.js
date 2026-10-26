import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { MessageBanner } from '@folio/stripes/components';

import { getAccountNumbersInUseMessage } from '../utils';

import css from './AccountNumbersInUseBanner.css';

// Default integrations have no account numbers field, so they never warn.
export const AccountNumbersInUseBanner = ({ integrationConfigs, integrationConfig }) => {
  const isDefaultConfig = integrationConfig?.exportTypeSpecificParameters?.vendorEdiOrdersExportConfig?.isDefaultConfig;
  const accounts = getAccountNumbersInUseMessage(integrationConfigs, integrationConfig);

  if (isDefaultConfig || !accounts) return null;

  return (
    <div className={css.marginBottomGutter}>
      <MessageBanner type="warning">
        <FormattedMessage
          id="ui-organizations.integration.edi.accountNumbers.inUseWarning"
          values={{ accounts }}
        />
      </MessageBanner>
    </div>
  );
};

AccountNumbersInUseBanner.propTypes = {
  integrationConfig: PropTypes.object,
  integrationConfigs: PropTypes.arrayOf(PropTypes.object),
};
