import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import { useEmailTemplate } from './useEmailTemplate';

const queryClient = new QueryClient();

const TEMPLATE = { id: 'templateId', name: 'Order email', active: true };

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useEmailTemplate', () => {
  const kyGet = jest.fn();

  beforeEach(() => {
    kyGet.mockClear().mockReturnValue({
      json: () => Promise.resolve(TEMPLATE),
    });
    useOkapiKy.mockClear().mockReturnValue({ get: kyGet });
  });

  it('should fetch the template by id', async () => {
    const { result } = renderHook(() => useEmailTemplate(TEMPLATE.id), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(kyGet).toHaveBeenCalledWith(`templates/${TEMPLATE.id}`);
    expect(result.current.template).toEqual(TEMPLATE);
  });

  it('should not fetch without id', () => {
    const { result } = renderHook(() => useEmailTemplate(undefined), { wrapper });

    expect(kyGet).not.toHaveBeenCalled();
    expect(result.current.template).toBeUndefined();
  });
});
