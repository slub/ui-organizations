import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { TEMPLATES_API } from '../../constants';

export const useEmailTemplate = (templateId) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'email-template' });

  const { data, isLoading } = useQuery(
    [namespace, templateId],
    () => ky.get(`${TEMPLATES_API}/${templateId}`).json(),
    { enabled: Boolean(templateId) },
  );

  return ({
    template: data,
    isLoading,
  });
};
