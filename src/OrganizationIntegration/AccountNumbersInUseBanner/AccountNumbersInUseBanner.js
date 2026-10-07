import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { MessageBanner } from '@folio/stripes/components';

import { getAccountNumbersInUseMessage } from '../utils';

import css from './AccountNumbersInUseBanner.css';

export const AccountNumbersInUseBanner = ({ integrationConfigs, integrationConfig }) => {
  const accounts = getAccountNumbersInUseMessage(integrationConfigs, integrationConfig);

  if (!accounts) return null;

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
