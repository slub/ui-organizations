import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { EMAIL_SETTINGS_API } from '../../constants';

const SMTP_CONFIGURATION_QUERY = 'scope==mod-email and key==smtp-configuration';

export const useSmtpConfiguration = () => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'smtp-configuration' });

  const { data, isLoading } = useQuery(
    [namespace],
    () => ky.get(EMAIL_SETTINGS_API, {
      searchParams: { query: SMTP_CONFIGURATION_QUERY },
    }).json(),
  );

  return ({
    smtpConfiguration: data?.settings?.[0]?.value,
    isLoading,
  });
};
