import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';
import { LIMIT_MAX } from '@folio/stripes-acq-components';

import { TEMPLATES_API } from '../../constants';

export const useEmailTemplates = (scope) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'email-templates' });

  const {
    data,
    isLoading,
    isSuccess,
  } = useQuery(
    [namespace, scope],
    () => ky.get(TEMPLATES_API, {
      searchParams: {
        query: `scope=="${scope}"`,
        limit: LIMIT_MAX,
      },
    }).json(),
  );

  return ({
    templates: data?.templates ?? [],
    isLoading,
    isLoaded: isSuccess,
  });
};
